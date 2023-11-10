import { S3UploadFileInput } from '@filesg/aws';
import { checkForMissingFilesInDir, createDir, listDirContent, LogMethod, rmDir, rmFile } from '@filesg/backend-common';
import {
  COMPONENT_ERROR_CODE,
  convertBinaryRepresentation,
  CreateFileTransactionResponse,
  CreateFileTransactionV2Request,
  FILE_TYPE,
  FilesUploadRequest,
  MIME_TYPE,
  TraceIdResponse,
  TRANSACTION_CREATION_METHOD,
} from '@filesg/common';
import { UnzipService } from '@filesg/zipper';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosInstance } from 'axios';
import { fromFile } from 'file-type';
import { createReadStream, existsSync as checkIfFileExists } from 'fs';
import { v4 } from 'uuid';

import {
  CreateTransactionException,
  CsvValidationException,
  DuplicateEntryAgencyPasswordException,
  ExtraFileAgencyPasswordException,
  ExtraFileException,
  InvalidFilePathFormatAgencyPasswordException,
  MissingFileException,
  MissingSidecarFileException,
  ParsingCsvException,
  ProcessMessageErrorException,
  RequestTimeoutException,
  SftpProcessorBaseException,
  UnsupportedFileTypeException,
  UploadTransactionFilesException,
  UploadWorkingFileToS3Exception,
} from '../../../common/custom-exceptions';
import { SidecarAgencyPasswordRecord, SidecarData } from '../../../common/dtos/sidecar-data';
import {
  CORE_API_CLIENT_PROVIDER,
  DOWNLOAD_DIR,
  LOCAL_EXTRACTED_SUBPATH,
  RESULT_LOG_PREFIX,
  S3_PROCESSING_DIR_PREFIX,
  SIDECAR_FILES_INFO,
  SLIFT_ENCRYPTED_FILE_EXT,
  TRANSFER_API_CLIENT_PROVIDER,
} from '../../../const';
import { LambdaSqsMessage, S3EventNotificationMsgBody, S3EventNotificationRecord } from '../../../typings';
import { FileSGConfigService } from '../../setups/config/config.service';
import { S3Service } from '../aws/s3.service';
import { SqsService } from '../aws/sqs.service';
import { SliftService } from '../slift/slift.service';
import { SidecarFileService } from './sidecar-file.service';

@Injectable()
export class SftpProcessorService {
  private readonly logger = new Logger(SftpProcessorService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly sqsService: SqsService,
    private readonly sidecarFileService: SidecarFileService,
    private readonly unzipService: UnzipService,
    private readonly sliftService: SliftService,
    private fileSGConfigService: FileSGConfigService,
    @Inject(CORE_API_CLIENT_PROVIDER) private readonly coreServiceClient: AxiosInstance,
    @Inject(TRANSFER_API_CLIENT_PROVIDER) private readonly transferServiceClient: AxiosInstance,
  ) {}

  @LogMethod()
  public async run(msg: LambdaSqsMessage) {
    this.logger.log(`Processing message: ${JSON.stringify(msg)}`);

    const { body } = msg;

    if (!body) {
      throw new ProcessMessageErrorException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, 'Message body is empty');
    }

    let Records: S3EventNotificationRecord[];
    try {
      Records = (JSON.parse(body) as S3EventNotificationMsgBody).Records;
    } catch (error) {
      throw new ProcessMessageErrorException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, 'Message body is not json');
    }

    if (!Records.length) {
      throw new ProcessMessageErrorException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, 'Message body has no record');
    }

    // S3 event notification only has 1 record
    const { s3 } = Records[0];
    const s3Key = `${s3.object.key}`;
    const filePaths = this.generateFilePaths(s3Key);

    try {
      await this.preProcess(filePaths);
      const sidecarData = await this.parseAndValidateCsv(filePaths);
      await this.process(filePaths, sidecarData);
      await this.postProcess(filePaths, msg);

      this.logger.log(`[${RESULT_LOG_PREFIX}][${s3Key}][SUCCESSS] SFTP Processor processed ${s3Key} successfully`);
    } catch (error) {
      await this.errorHandler(error, s3Key, msg.messageId, msg.receiptHandle);
    } finally {
      await this.clean(filePaths);
    }
  }

  protected async preProcess(paths: ReturnType<typeof this.generateFilePaths>): Promise<void> {
    const { s3Key, encryptedZip, plainZip, extractedZipDir, localWorkingDir } = paths;

    await createDir(localWorkingDir);
    await this.sliftService.init(localWorkingDir);
    await this.s3Service.downloadFileFromSftpBucketToDisk(s3Key, encryptedZip);
    await this.sliftService.decrypt(encryptedZip, plainZip);
    // deleting the downloaded encrypted file before unzipping to clean up the space
    await rmFile(encryptedZip);
    await this.unzipService.unzipToDisk(plainZip, extractedZipDir);
  }

  protected async parseAndValidateCsv(paths: ReturnType<typeof this.generateFilePaths>): Promise<SidecarData> {
    await this.sidecarFileService.checkSidecarFilesExistsOrThrow(paths.extractedZipDir);

    const sidecarData = await this.sidecarFileService.parseSidecarFiles(paths.extractedZipDir);

    await this.checkForMissingIssuanceFiles(paths, sidecarData);
    await this.checkForExtraIssuanceFiles(paths, sidecarData);
    await this.detectAndPopulateMimeType(paths, sidecarData);
    this.validateFilePathInsideAgencyPasswordSidecar(paths, sidecarData);

    return sidecarData;
  }

  protected async process(
    { s3WorkingDir, extractedZipDir }: ReturnType<typeof this.generateFilePaths>,
    sidecarData: SidecarData,
  ): Promise<void> {
    const uploadFileInputs: S3UploadFileInput[] = [];
    for (const { name, mimeType, checksum } of sidecarData.files) {
      uploadFileInputs.push({
        Key: `${s3WorkingDir}/${name}`,
        Body: createReadStream(`${extractedZipDir}/${name}`),
        ContentType: mimeType!,
        ChecksumSHA256: convertBinaryRepresentation(checksum, 'hex', 'base64'), // S3 uses base64 instead of hex for checksum
      });
    }

    await this.s3Service.uploadFilesToSftpBucket(uploadFileInputs);
    const createTransactionRes = await this.createTransaction(sidecarData);
    await this.uploadTransactionFiles(createTransactionRes.accessToken!, sidecarData, s3WorkingDir);
  }

  /**
   * This function contain codes that should only be executed if processing succeeded
   */
  protected async postProcess({ s3Key }: ReturnType<typeof this.generateFilePaths>, message: LambdaSqsMessage): Promise<void> {
    // delete the original file from s3
    await this.s3Service.deleteFileFromSftpBucket(s3Key);
    await this.sqsService.deleteMessageInQueueSftpProcessor(message.messageId, message.receiptHandle);
  }

  /**
   * This function contains cleaning up code that will be executed in finally block.
   */
  protected async clean({ localWorkingDir, s3WorkingDir }: ReturnType<typeof this.generateFilePaths>): Promise<void> {
    await rmDir(localWorkingDir);
    await this.s3Service.deleteFilesByPrefixFromSftpBucket(s3WorkingDir);
  }

  protected generateFilePaths(s3Key: string) {
    const uuid = v4();

    // The middle path is always the agency code
    const splitS3Key = s3Key.split('/');
    const agencyCode = splitS3Key[1];
    const eserviceCode = splitS3Key[2];
    const localWorkingDir = `${DOWNLOAD_DIR}/${uuid}`;
    const { encryptedFileName, plainFileName } = this.deriveFilenames(s3Key);
    const encryptedZip = `${localWorkingDir}/${encryptedFileName}`;
    const plainZip = `${localWorkingDir}/${plainFileName}`;
    const extractedZipDir = `${localWorkingDir}/${LOCAL_EXTRACTED_SUBPATH}`;
    const s3WorkingDir = `${S3_PROCESSING_DIR_PREFIX}/${agencyCode}/${eserviceCode}/${uuid}`;

    return {
      s3Key,
      agencyCode,
      eserviceCode,
      processUuid: uuid,
      localWorkingDir,
      encryptedZip,
      plainZip,
      extractedZipDir,
      encryptedFileName,
      plainFileName,
      s3WorkingDir,
    };
  }

  /**
   * SLIFT encrypted file is .p7 in additional to the original extension
   * Example: uploadedFile.zip.p7
   *
   */
  protected deriveFilenames(s3Key: string) {
    const encryptedFileName = s3Key.split('/').slice(-1)[0];
    const plainFileName = encryptedFileName.replace(SLIFT_ENCRYPTED_FILE_EXT, '');

    return {
      encryptedFileName,
      plainFileName,
    };
  }

  protected async checkForMissingIssuanceFiles(
    { extractedZipDir }: ReturnType<typeof this.generateFilePaths>,
    sidecarData: SidecarData,
  ): Promise<void> {
    const missingFiles = await checkForMissingFilesInDir(
      extractedZipDir,
      sidecarData.files.map((file) => file.name),
    );

    if (missingFiles.length > 0) {
      throw new MissingFileException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, missingFiles);
    }
  }

  protected async checkForExtraIssuanceFiles(
    { extractedZipDir }: ReturnType<typeof this.generateFilePaths>,
    sidecarData: SidecarData,
  ): Promise<void> {
    const filesInDir = await listDirContent(extractedZipDir);
    const requiredFiles = [...sidecarData.files.map((file) => file.name), ...SIDECAR_FILES_INFO.map((info) => info.name)];

    const extraFiles = filesInDir.filter((dirFile) => !requiredFiles.includes(dirFile));

    if (extraFiles.length > 0) {
      throw new ExtraFileException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, extraFiles);
    }
  }

  protected async detectAndPopulateMimeType(
    { extractedZipDir }: ReturnType<typeof this.generateFilePaths>,
    sidecarData: SidecarData,
  ): Promise<void> {
    const unsupportedFiles: ConstructorParameters<typeof UnsupportedFileTypeException>[1] = [];
    for (const fileRecord of sidecarData.files) {
      const mimeType = await fromFile(`${extractedZipDir}/${fileRecord.name}`);

      if (!mimeType?.ext || !(Object.values(FILE_TYPE) as string[]).includes(mimeType.ext as string)) {
        unsupportedFiles.push({
          name: fileRecord.name,
          detectedType: mimeType?.ext ?? 'not detected',
        });
        continue;
      }

      fileRecord.mimeType = mimeType.mime as MIME_TYPE;
    }

    if (unsupportedFiles.length > 0) {
      throw new UnsupportedFileTypeException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, unsupportedFiles);
    }
  }

  protected validateFilePathInsideAgencyPasswordSidecar(
    { extractedZipDir }: ReturnType<typeof this.generateFilePaths>,
    { agencyPassword }: SidecarData,
  ) {
    const extraFiles = agencyPassword.filter(({ filePath }) => !checkIfFileExists(`${extractedZipDir}/${filePath.split('/')[0]}`));
    if (extraFiles.length > 0) {
      throw new ExtraFileAgencyPasswordException(
        COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE,
        extraFiles.map(({ filePath }) => filePath.split('/')[0]),
      );
    }

    const invalidFormat = agencyPassword.filter(({ filePath }) => {
      const filePathSplit = filePath.split('/');
      return filePathSplit.length <= 1 || filePathSplit.at(-1) === '';
    });
    if (invalidFormat.length > 0) {
      throw new InvalidFilePathFormatAgencyPasswordException(
        COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE,
        invalidFormat.map(({ filePath }) => filePath),
      );
    }

    const uniqueFilePaths = new Set(agencyPassword.map(({ filePath }) => filePath));
    if (uniqueFilePaths.size < agencyPassword.length) {
      throw new DuplicateEntryAgencyPasswordException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE);
    }
  }

  protected async createTransaction(sidecarData: SidecarData): Promise<CreateFileTransactionResponse> {
    try {
      return (
        await this.coreServiceClient.post<TraceIdResponse<CreateFileTransactionResponse>>(
          'v2/transaction/file/client',
          this.getCreateTransactionPayload(sidecarData),
          {
            headers: {
              'x-client-id': sidecarData.transactions[0].clientId,
              'x-client-secret': sidecarData.transactions[0].clientSecret,
            },
          },
        )
      ).data.data;
    } catch (error) {
      const { message: originErrorMsg, response: errorResponse } = error as AxiosError;
      const errorResData = errorResponse?.data;

      if (errorResponse?.status === HttpStatus.REQUEST_TIMEOUT) {
        throw new RequestTimeoutException('service-core CreateTransaction', originErrorMsg);
      }

      throw new CreateTransactionException(originErrorMsg, errorResData);
    }
  }

  protected async uploadTransactionFiles(uploadJwt: string, sidecarData: SidecarData, s3WorkingDir: string) {
    try {
      return await this.transferServiceClient.post<string>(
        'v1/file-upload',
        this.getUploadTransactionFilesPayload(sidecarData, s3WorkingDir),
        {
          headers: {
            Authorization: `Bearer ${uploadJwt}`,
          },
        },
      );
    } catch (error) {
      const { message: originErrorMsg, response: errorResponse } = error as AxiosError;
      const errorResData = errorResponse?.data;

      if (errorResponse?.status === HttpStatus.REQUEST_TIMEOUT) {
        throw new RequestTimeoutException('service-transfer UploadFile', originErrorMsg);
      }

      throw new UploadTransactionFilesException(originErrorMsg, errorResData);
    }
  }

  protected processAgencyPassword(agencyPassword: SidecarAgencyPasswordRecord[]) {
    const agencyPasswordMap: Record<string, Record<string, string>> = {};
    for (let x = 0; x < agencyPassword.length; x++) {
      const { filePath, password } = agencyPassword[x];
      const [fileName, ...fileWithinFolder] = filePath.split('/');
      if (!agencyPasswordMap[fileName]) {
        agencyPasswordMap[fileName] = {};
      }
      agencyPasswordMap[fileName][`${fileWithinFolder.join('/')}`] = password;
    }
    return agencyPasswordMap;
  }

  protected getCreateTransactionPayload({
    files,
    transactions,
    recipients,
    agencyPassword,
    notifications,
  }: SidecarData): CreateFileTransactionV2Request {
    // Using only transactions[0] because there can only be 1 row of transaction. Validated in class-validator
    const transaction = transactions[0];
    const agencyPasswordMap = this.processAgencyPassword(agencyPassword);

    return {
      files: files.map(({ name, checksum, metadata, deleteAt, expiry, isPasswordEncryptionRequired }) => ({
        name,
        checksum,
        metadata,
        deleteAt,
        expiry,
        isPasswordEncryptionRequired,
        ...(agencyPasswordMap[name] && { agencyPassword: agencyPasswordMap[name] }),
      })),
      application: {
        type: transaction.applicationType,
        externalRefId: transaction.applicationExternalRefId,
      },
      transaction: {
        type: transaction.transactionType,
        name: transaction.transactionName,
        creationMethod: TRANSACTION_CREATION_METHOD.SFTP,
        isAcknowledgementRequired: transaction.isAcknowledgementRequired,
        acknowledgementTemplateUuid: transaction.acknowledgementTemplateId,
        customAgencyMessage: {
          transaction: {
            templateId: transaction.transactionMessageId,
            templateInput: transaction.transactionMessageInput,
          },
          notifications,
        },
        recipients: recipients.map(({ fullName, uin, dob, email, contact, metadata }) => ({
          name: fullName,
          uin,
          dob,
          email,
          contact,
          metadata,
        })),
      },
    };
  }

  protected getUploadTransactionFilesPayload({ files }: SidecarData, s3WorkingDir: string): FilesUploadRequest {
    const sftpBucket = this.fileSGConfigService.awsConfig.s3SftpBucket;

    return {
      files: files.map(({ name }) => ({
        fileName: name,
        isOA: false,
        s3FileData: {
          bucketName: sftpBucket,
          key: `${s3WorkingDir}/${name}`,
        },
      })),
    };
  }

  protected async errorHandler(error: unknown, filePath: string, messageId: string, msgReceiptHandle: string) {
    // logging the full error just in case there is more details
    this.logger.error(error);

    switch (true) {
      case error instanceof MissingSidecarFileException: {
        const missingSidecarFiles = (error as MissingSidecarFileException).errorData as string[];
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] Missing sidecar files: ${missingSidecarFiles}`);
        break;
      }
      case error instanceof ParsingCsvException: {
        const errorData = (error as ParsingCsvException).errorData as ConstructorParameters<typeof ParsingCsvException>[1];
        const formatted = errorData.map(({ filename, msg }) => `${filename}(${msg})`);
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] CSV parsing error: ${formatted}`);
        break;
      }
      case error instanceof CsvValidationException: {
        const errorData = (error as CsvValidationException).errorData as ConstructorParameters<typeof CsvValidationException>[1];
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] CSV parsing error: ${JSON.stringify(errorData)}`);
        break;
      }
      case error instanceof MissingFileException: {
        const missingFiles = (error as MissingFileException).errorData as string[];
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] Missing files: ${missingFiles}`);
        break;
      }
      case error instanceof ExtraFileException: {
        const extraFiles = (error as ExtraFileException).errorData as string[];
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] Extra files: ${extraFiles}`);
        break;
      }
      case error instanceof UnsupportedFileTypeException: {
        const unsupportedFiles = (error as UnsupportedFileTypeException).errorData as ConstructorParameters<
          typeof UnsupportedFileTypeException
        >[1];
        const formatted = unsupportedFiles.map(({ name, detectedType }) => `${name}(${detectedType})`);
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] Files with unsupported file type:  ${formatted}`);
        break;
      }
      case error instanceof UploadWorkingFileToS3Exception: {
        const errorData = (error as UploadWorkingFileToS3Exception).errorData as ConstructorParameters<
          typeof UploadWorkingFileToS3Exception
        >[1];
        const formatted = errorData.map(({ key, msg }) => `${key}(${msg})`);
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] Error uploading file to s3:  ${formatted}`);
        break;
      }
      case error instanceof CreateTransactionException:
      case error instanceof UploadTransactionFilesException: {
        const { message, errorData } = error as UploadTransactionFilesException | CreateTransactionException;

        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] ${message}: ${JSON.stringify(errorData)}`);
        break;
      }
      case error instanceof RequestTimeoutException: {
        const { message } = error as RequestTimeoutException;
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] ${message}`);
        break;
      }
      default:
        this.logger.error(`[${RESULT_LOG_PREFIX}][ERROR][${filePath}] ${(error as Error).message}`);
    }

    if (error instanceof SftpProcessorBaseException && !error.toRetryProcessing) {
      await this.sqsService.deleteMessageInQueueSftpProcessor(messageId, msgReceiptHandle);
    }
  }
}
