import {
  DocumentEncryptionErrorOutput,
  DocumentEncryptionInput,
  DocumentEncryptionSuccessOutput,
  FileSGBaseException,
  filterFilesNotInDirAndSubDir,
  getAbsoluteFilePath,
  getFileTypeFromFile,
  rmDir,
} from '@filesg/backend-common';
import { AgencyPassword, COMPONENT_ERROR_CODE, MIME_TYPE } from '@filesg/common';
import { UnzipService, ZipService, ZipStream } from '@filesg/zipper';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { stat } from 'fs/promises';
import os from 'os';
import path from 'path';
import Piscina from 'piscina';
import { PassThrough, Readable } from 'stream';

import {
  GetFileSizeException,
  MissingFileException,
  UnsupportedFileTypeException,
  UnsupportedFileTypeForEncryptionException,
} from '../../../common/custom-exceptions';
import { getTargetUnzipDirectory } from '../../../const';
import { AgencyPasswordFileInfo } from '../../../typings/common';
import { FileSGConfigService } from '../../setups/config/config.service';
import { S3Service } from '../aws/s3.service';
import { StsService } from '../aws/sts.service';

@Injectable()
export class DocEncryptionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DocEncryptionService.name);
  private readonly cpuLength: number = os.cpus().length;
  private abortController: AbortController;
  private workerPool: Piscina;

  constructor(
    private readonly unzipService: UnzipService,
    private readonly zipService: ZipService,
    private readonly s3Service: S3Service,
    private readonly stsService: StsService,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  onApplicationBootstrap() {
    this.workerPool = new Piscina({
      filename: path.resolve(__dirname, 'scripts/encryption-worker.js'),
      idleTimeout: 900000,
      minThreads: this.cpuLength - 3,
      maxThreads: this.cpuLength - 3,
      resourceLimits: {
        maxOldGenerationSizeMb: 3072,
      },
    });

    this.abortController = new AbortController();
  }

  /**
   * This lambda will perform the following operations:
   * 1. Download the file from the stg-clean bucket based on the Key
   * 2. Check whether the file is a zip
   * 3. If is a zip, unzip and zip all the files with password
   * 4. Else, zip the file with password
   * 5. Upload the zip to the main bucket based on Key
   */
  async processEvent(event: DocumentEncryptionInput): Promise<DocumentEncryptionSuccessOutput | DocumentEncryptionErrorOutput> {
    const { fileName, fromKey, toKey, assumeRole, password, agencyPassword } = event;
    const targetUnzipDirectory = getTargetUnzipDirectory();

    let outputZipStream: ZipStream;

    try {
      const credentials = await this.stsService.assumeDocumentEncryptionRole(assumeRole.receiver);
      const assumedS3Client = await this.s3Service.createAssumedClient(credentials);

      const { Body, ContentType } = await this.s3Service.downloadFileFromStgCleanBucket(fromKey, assumedS3Client);

      // 2. validation
      if (!(Object.values(MIME_TYPE) as string[]).includes(ContentType)) {
        throw new UnsupportedFileTypeException(COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE, ContentType);
      }

      // 3. process and encrypt the input file
      const isChildFilesProtectionRequired = agencyPassword && Object.keys(agencyPassword).length > 0;
      if (isChildFilesProtectionRequired) {
        outputZipStream = await this.processAgencyPasswordZipFile(
          fileName,
          agencyPassword,
          Body as Readable,
          password,
          targetUnzipDirectory,
        );
      } else {
        outputZipStream = await this.processMainFile(Body as Readable, ContentType, fileName, password, targetUnzipDirectory);
      }

      // 4. upload the encrypted file to s3 main bucket
      await this.s3Service.uploadZipToMainBucket(
        { Key: toKey, Body: outputZipStream.pipe(this.getPassThrough()), ContentType: MIME_TYPE.ZIP },
        assumedS3Client,
      );

      // 5. return result
      const fileSize = await this.s3Service.getFileSizeFromMainBucket(toKey, assumedS3Client);
      return { fromKey, toKey, size: fileSize };
    } catch (error) {
      const errorMessage = (error as Error).message;
      let internalLog: string | undefined = undefined;

      if (error instanceof FileSGBaseException) {
        internalLog = error.internalLog;
      }

      this.logger.error(
        `[${DocEncryptionService.name} - processEvent] Failed to zip encrypt: ${errorMessage}. ${internalLog ? internalLog : ''}`,
      );

      if (error instanceof GetFileSizeException) {
        return { errorMessage, isHeadObjectError: true };
      }

      return { errorMessage };
    } finally {
      // remove all the file in the target directory
      await rmDir(targetUnzipDirectory);
    }
  }

  // putting this instantiation of pass through into a separate function so that is it mockable during testing
  protected getPassThrough() {
    return new PassThrough();
  }

  protected async processMainFile(
    Body: Readable,
    ContentType: string,
    fileName: string,
    password: string,
    targetUnzipDirectory: string,
  ): Promise<ZipStream> {
    if (ContentType === MIME_TYPE.ZIP) {
      return await this.unzipService.unzipToZipStream(Body, targetUnzipDirectory, password);
    } else {
      return await this.zipService.zipToStream([{ name: fileName, body: Body }], password);
    }
  }

  protected async processAgencyPasswordZipFile(
    mainFilename: string,
    agencyPassword: AgencyPassword,
    Body: Readable,
    password: string,
    targetUnzipDirectory: string,
  ): Promise<ZipStream> {
    const filePaths = Object.keys(agencyPassword);

    // 1. unzip to disk `UNZIP_DIR`
    await this.unzipService.unzipToDisk(Body, targetUnzipDirectory);

    // 2. [validation] check files in the `agencyPassword` exists in the extracted zip path location
    const missingFiles = await filterFilesNotInDirAndSubDir(targetUnzipDirectory, filePaths);

    if (missingFiles.length > 0) {
      throw new MissingFileException(COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE, mainFilename, missingFiles);
    }

    /**
     * 3. [validation] check for supported file types. PDF and XLSX only
     *    Loop through the `agencyPassword` file path and get the file mime type
     */
    const agencyPasswordFiles = await Promise.all<AgencyPasswordFileInfo>(
      filePaths.map(async (filePath) => {
        const absoluteFilePath = getAbsoluteFilePath(targetUnzipDirectory, filePath);
        const fileTypeResult = await getFileTypeFromFile(absoluteFilePath);
        const fileSize = (await stat(absoluteFilePath)).size;

        return {
          filePath,
          absoluteFilePath,
          mime: fileTypeResult?.mime,
          ext: fileTypeResult?.ext,
          size: fileSize,
        };
      }),
    );

    const supportedMimeTypes = [MIME_TYPE.PDF, MIME_TYPE.XLSX];
    const notSupportedAgencyPasswordFiles = agencyPasswordFiles.filter((file) => !supportedMimeTypes.includes(file.mime as MIME_TYPE));

    if (notSupportedAgencyPasswordFiles.length > 0) {
      throw new UnsupportedFileTypeForEncryptionException(
        COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE,
        mainFilename,
        notSupportedAgencyPasswordFiles,
      );
    }

    const { signal } = this.abortController;
    const ENCRYPT_FILE_CHUNK_SIZE = this.cpuLength - 3;
    const longEncryptionTimeFiles = agencyPasswordFiles.filter((file) => file.mime === MIME_TYPE.XLSX).sort((a, b) => a.size - b.size);
    const shortEncryptionTimeFiles = agencyPasswordFiles.filter((file) => file.mime !== MIME_TYPE.XLSX);

    try {
      this.logger.log('Encrypting files with worker threads');
      // process all the files that require long encryption time first
      for (let i = 0; i < longEncryptionTimeFiles.length; i = i + ENCRYPT_FILE_CHUNK_SIZE) {
        const chunk = longEncryptionTimeFiles.slice(i, i + ENCRYPT_FILE_CHUNK_SIZE);

        const workerPromises = chunk.map(({ absoluteFilePath, filePath }) =>
          this.workerPool.run(
            { inputPath: absoluteFilePath, outputPath: absoluteFilePath, password: agencyPassword[filePath] },
            { name: 'encryptExcel', signal },
          ),
        );

        const result = await Promise.all(workerPromises);
        this.logger.log({ result });
      }

      // process the remaining files encryption, can put a switch case when supporting more mime type in the future
      for (let i = 0; i < shortEncryptionTimeFiles.length; i = i + ENCRYPT_FILE_CHUNK_SIZE) {
        const chunk = shortEncryptionTimeFiles.slice(i, i + ENCRYPT_FILE_CHUNK_SIZE);

        const workerPromises = chunk.map(({ absoluteFilePath, filePath }) =>
          this.workerPool.run(
            {
              inputPath: absoluteFilePath,
              outputPath: absoluteFilePath,
              password: agencyPassword[filePath],
              pdfBoxJarFilePath: this.fileSGConfigService.systemConfig.pdfBoxJarFilePath,
            },
            { name: 'encryptPdf', signal },
          ),
        );

        const result = await Promise.all(workerPromises);
        this.logger.log({ result });
      }

      this.logger.log('[Succeed] Encrypting files with worker threads');
    } catch (error) {
      this.abortController.abort();
      throw error;
    }

    // 5. zip all the files again
    return await this.zipService.zipDirToStream(targetUnzipDirectory, password);
  }
}
