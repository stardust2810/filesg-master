import { S3Client } from '@aws-sdk/client-s3';
import { ExtendedCopyObjectCommandOutput, UploadObjectCommandOutput } from '@filesg/aws';
import { FailedFileAsset, FileAssetMetaData, JSONParseException, UnauthorizedRequestException } from '@filesg/backend-common';
import {
  CheckAndDeleteFileSessionResponse,
  COMPONENT_ERROR_CODE,
  EVENT,
  FEATURE_TOGGLE,
  File,
  FILE_TYPE,
  FileInfo,
  FilesUploadRequest,
  FileUploadAgencyInfo,
  MIME_TYPE,
} from '@filesg/common';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { fromBuffer } from 'file-type';

import { S3TransferException } from '../../../common/custom-exceptions';
import {
  DuplicateFileNameException,
  FilesFailedToUploadException,
  FileSizeException,
  InvalidChecksumException,
  MissingS3FileException,
  NonZipFileAgencyPasswordException,
  UnsupportedFileTypeException,
  UploadFileMismatchException,
} from '../../../common/filters/custom-exceptions.filter';
import {
  CopyModeFileUploadDetails,
  FileUploadDetails,
  FileUploadJwtPayloadInRequest,
  MGMT_SERVICE_API_CLIENT_PROVIDER,
  OaFileUploadDetails,
  UploadModeFileUploadDetails,
} from '../../../typings/common';
import { oaSigningKeyEncryptionTransformer } from '../../../utils/encryption';
import generateChecksum from '../../../utils/helper';
import { getFileTypeFromMimeType } from '../../../utils/mime-detector';
import { FileSGConfigService } from '../../setups/config/config.service';
import { S3Service } from '../aws/s3.service';
import { SqsService } from '../aws/sqs.service';
import { StsService } from '../aws/sts.service';
import { OaDocumentService } from '../oa-document/oa-document.service';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private readonly awsS3Service: S3Service,
    private readonly awsSqsService: SqsService,
    private readonly awsStsService: StsService,
    private readonly oaDocument: OaDocumentService,
    private readonly fileSGConfigService: FileSGConfigService,
    @Inject(MGMT_SERVICE_API_CLIENT_PROVIDER) private readonly mgmtServiceApiClient: AxiosInstance,
  ) {}

  async fileUpload({ files: reqFiles }: FilesUploadRequest, jwtPayloadInRequest: FileUploadJwtPayloadInRequest) {
    const { transactionUuid } = jwtPayloadInRequest;

    const response = await this.mgmtServiceApiClient.get<CheckAndDeleteFileSessionResponse>(`v1/file-upload-auth/${transactionUuid}`);

    if (!response.data) {
      throw new UnauthorizedRequestException(COMPONENT_ERROR_CODE.FILE_UPLOAD);
    }

    const { agencyInfo, transactionInfo } = response.data;
    // decrypt the encrypted key here before passing to handler
    agencyInfo.sk = this.decryptSigningKey(agencyInfo.sk);

    const credentials = await this.awsStsService.assumeUploadRole();
    const s3Client = await this.awsS3Service.createAssumedClient(credentials);

    await this.verifyS3FileExistence(reqFiles, s3Client);
    const reconciledFileDetails = await this.verifyAndReconcileTxnFileAndReqFile(reqFiles, transactionInfo.files, agencyInfo, s3Client);

    this.verifyChecksum(reconciledFileDetails);
    this.verifyMimeType(reconciledFileDetails);
    this.verifyValidSize(reconciledFileDetails);

    const fileTransferResult = await Promise.allSettled(reconciledFileDetails.map((file) => this.transferFileToStgBucket(file, s3Client)));
    this.logger.log('Attempt to transfer to stg bucket completed');

    const failedToUploadFiles = fileTransferResult.filter((fileInfo): fileInfo is PromiseRejectedResult => fileInfo.status === 'rejected');

    if (failedToUploadFiles.length > 0) {
      const successfullyUploadedFiles = fileTransferResult
        .filter(
          (result): result is PromiseFulfilledResult<UploadObjectCommandOutput | ExtendedCopyObjectCommandOutput> =>
            result.status === 'fulfilled',
        )
        .map((result) => (this.isUploadObjectCommandOutput(result.value) ? result.value.key : result.value.toKey));

      const failedFiles: FailedFileAsset[] = failedToUploadFiles.map((file) => {
        const { s3TransferError } = file.reason as S3TransferException;
        return { fileAssetId: s3TransferError.fileName, failedReason: s3TransferError.awsErrorResponse };
      });

      if (successfullyUploadedFiles.length > 0) {
        await this.awsS3Service.deleteFilesFromStgBucket(successfullyUploadedFiles, s3Client);
      }

      await this.awsSqsService.sendMessageToQueueCoreEvents({
        event: EVENT.FILES_UPLOAD_TO_STG_FAILED,
        payload: {
          failedFiles,
          transactionId: transactionInfo.transactionUuid,
          creationMethod: transactionInfo.creationMethod,
        },
      });

      throw new FilesFailedToUploadException(
        COMPONENT_ERROR_CODE.FILE_UPLOAD,
        failedToUploadFiles.map((file) => file.reason),
      );
    }

    await this.awsSqsService.sendMessageToQueueCoreEvents({
      event: EVENT.FILES_UPLOAD_TO_STG_COMPLETED,
      payload: {
        transactionId: transactionInfo.transactionUuid,
        fileAssetInfos: reconciledFileDetails.map(this.sqsFileAssetInfosMapper, this),
      },
    });

    return 'Successfully uploaded file(s)';
  }

  /**
   * This method will verify if there is any missing reqFiles or additional reqFiles against txnFiles
   *  and reconcile reqFile with txnFile
   *
   * @param reqFiles The files that are passed in via request a.k.a uploaded files
   * @param txnFiles The files that are required based on createTransaction API
   */
  protected async verifyAndReconcileTxnFileAndReqFile(
    reqFiles: File[],
    txnFiles: FileInfo[],
    agencyInfo: FileUploadAgencyInfo,
    s3Client: S3Client,
  ): Promise<FileUploadDetails[]> {
    const [txnFileNames, txnFilesNameMap] = txnFiles.reduce(
      (acc, curr) => {
        const txnFileName = curr.name;
        acc[0].push(txnFileName);
        acc[1][txnFileName] = curr;

        return acc;
      },
      [[], {}] as [string[], Record<string, FileInfo>],
    );
    const reqFileNames = reqFiles.map((file) => file.fileName);

    // check for duplicate file names
    if (reqFileNames.length !== new Set(reqFileNames).size) {
      throw new DuplicateFileNameException(COMPONENT_ERROR_CODE.FILE_UPLOAD);
    }

    const missingFileNames = txnFileNames.filter((txnFileName) => !reqFileNames.includes(txnFileName));
    const unexpectedFileNames = reqFileNames.filter((reqFileName) => !txnFileNames.includes(reqFileName));

    if (missingFileNames.length > 0 || unexpectedFileNames.length > 0) {
      const internalLog = `The following files mismatched: ${JSON.stringify({
        missingFileNames,
        unexpectedFileNames,
      })}`;
      throw new UploadFileMismatchException(COMPONENT_ERROR_CODE.FILE_UPLOAD, internalLog);
    }

    return await Promise.all(
      reqFiles.map(async (reqFile) => {
        switch (true) {
          case reqFile.isOA:
            return await this.reconcileOaFile(reqFile, txnFilesNameMap[reqFile.fileName], agencyInfo);
          case !!reqFile.fileData:
            return await this.reconcileUploadModeFile(reqFile, txnFilesNameMap[reqFile.fileName]);
          case !!reqFile.s3FileData:
            return await this.reconcileCopyModeFile(reqFile, txnFilesNameMap[reqFile.fileName], s3Client);
          default:
            // doing a default case just in case
            throw new InternalServerErrorException('Did not expect to get here');
        }
      }),
    );
  }

  protected async reconcileOaFile(reqFile: File, txnFile: FileInfo, agencyInfo: FileUploadAgencyInfo): Promise<OaFileUploadDetails> {
    if (txnFile.encryptedAgencyPassword) {
      throw new NonZipFileAgencyPasswordException(COMPONENT_ERROR_CODE.FILE_UPLOAD);
    }

    let oaJsonObject = null;
    const { fileName, fileData, oaType } = reqFile;
    const fileBuffer = Buffer.from(fileData!, 'base64');

    try {
      oaJsonObject = JSON.parse(fileBuffer.toString());
    } catch (err) {
      throw new JSONParseException(COMPONENT_ERROR_CODE.FILE_UPLOAD, fileName, err);
    }

    const { signedDocument, oaCertificateId } = await this.oaDocument.createOADocument(oaType!, oaJsonObject, agencyInfo);
    const signedDocumentString = JSON.stringify(signedDocument);
    const signedDocumentBuffer = Buffer.from(signedDocumentString);

    return {
      type: 'OA',
      name: fileName,
      fileAssetId: txnFile.fileAssetId,
      generatedChecksum: generateChecksum(fileBuffer),
      expectedChecksum: txnFile.checksum,
      isPasswordEncryptionRequired: txnFile.isPasswordEncryptionRequired,
      oaCertificateId: oaCertificateId!,
      oaCertificateHash: signedDocument.signature.targetHash,
      buffer: signedDocumentBuffer,
      size: Buffer.byteLength(signedDocumentBuffer),
    };
  }

  protected async reconcileUploadModeFile(reqFile: File, txnFile: FileInfo): Promise<UploadModeFileUploadDetails> {
    const { fileName } = reqFile;
    const fileBuffer = Buffer.from(reqFile.fileData!, 'base64');
    const mimeType = (await fromBuffer(fileBuffer))?.mime;

    if (mimeType !== MIME_TYPE.ZIP && txnFile.encryptedAgencyPassword) {
      throw new NonZipFileAgencyPasswordException(COMPONENT_ERROR_CODE.FILE_UPLOAD);
    }

    return {
      type: 'UPLOAD_MODE',
      mimeType,
      name: fileName,
      fileAssetId: txnFile.fileAssetId,
      generatedChecksum: generateChecksum(fileBuffer),
      expectedChecksum: txnFile.checksum,
      isPasswordEncryptionRequired: txnFile.isPasswordEncryptionRequired,
      encryptedAgencyPassword: txnFile.encryptedAgencyPassword,
      buffer: fileBuffer,
      size: Buffer.byteLength(fileBuffer),
    };
  }

  protected async reconcileCopyModeFile(reqFile: File, txnFile: FileInfo, s3Client: S3Client): Promise<CopyModeFileUploadDetails> {
    const { fileName, s3FileData } = reqFile;
    const { mimeType, sizeInBytes, checksum } = await this.awsS3Service.getFileMetadata(s3FileData!.bucketName, s3FileData!.key, s3Client);

    if (mimeType !== MIME_TYPE.ZIP && txnFile.encryptedAgencyPassword) {
      throw new NonZipFileAgencyPasswordException(COMPONENT_ERROR_CODE.FILE_UPLOAD);
    }

    return {
      type: 'COPY_MODE',
      mimeType,
      name: fileName,
      fileAssetId: txnFile.fileAssetId,
      generatedChecksum: checksum ?? '',
      expectedChecksum: txnFile.checksum,
      isPasswordEncryptionRequired: txnFile.isPasswordEncryptionRequired,
      encryptedAgencyPassword: txnFile.encryptedAgencyPassword,
      fromBucket: s3FileData!.bucketName,
      fromKey: s3FileData!.key,
      size: sizeInBytes ?? 0,
    };
  }

  protected async verifyS3FileExistence(files: File[], s3Client?: S3Client) {
    const s3Files = files
      .filter((file) => !!file.s3FileData)
      .map((file) => {
        const { bucketName, key } = file.s3FileData!;

        return {
          bucketName,
          key,
          getChecksum: false,
        };
      });

    const missingS3Files = await this.awsS3Service.checkForMissingFilesInS3(s3Files, s3Client);

    if (missingS3Files.length > 0) {
      throw new MissingS3FileException(COMPONENT_ERROR_CODE.FILE_UPLOAD, missingS3Files);
    }
  }

  /**
   * This function checks that the generatedChecksum matches expectedChecksum
   */
  protected verifyChecksum(files: FileUploadDetails[]) {
    const mismatchedFileNames = files
      .filter(({ expectedChecksum, generatedChecksum, type }) => {
        // As localstack doesn't store the checksumSHA256, this will definitely fail locally. Hence, not checking
        if (type === 'COPY_MODE' && this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON) {
          return false;
        }

        return expectedChecksum !== generatedChecksum;
      })
      .map((file) => file.name);

    if (mismatchedFileNames.length > 0) {
      throw new InvalidChecksumException(COMPONENT_ERROR_CODE.FILE_UPLOAD, mismatchedFileNames);
    }
  }

  /**
   * This function checks that the mime type is FileSG acceptable type
   */
  protected verifyMimeType(files: FileUploadDetails[]) {
    const invalidMimeTypeFiles = files
      .filter((file) => {
        // OA has no mimetype as it is fixed to MIME_TYPE.OA
        if (file.type === 'OA') {
          return false;
        }

        return !(Object.values(MIME_TYPE) as string[]).includes(file.mimeType as string);
      })
      .map((file) => ({
        name: file.name,
        detectedType: (file as UploadModeFileUploadDetails | CopyModeFileUploadDetails).mimeType,
      }));

    if (invalidMimeTypeFiles.length > 0) {
      const internalLog = `Wrong File Type for files: ${JSON.stringify(invalidMimeTypeFiles)}.`;
      throw new UnsupportedFileTypeException(
        COMPONENT_ERROR_CODE.FILE_UPLOAD,
        invalidMimeTypeFiles.map(({ name }) => name),
        internalLog,
      );
    }
  }

  /**
   * This function checks that all input has valid size
   */
  protected verifyValidSize(files: FileUploadDetails[]) {
    const invalidSizeFileNames = files.filter((file) => file.size <= 0).map((file) => file.name);

    if (invalidSizeFileNames.length > 0) {
      const internalLog = `Unable to determine the file size of ${JSON.stringify(invalidSizeFileNames)}`;
      throw new FileSizeException(COMPONENT_ERROR_CODE.FILE_UPLOAD, internalLog);
    }
  }

  /**
   * This function will either upload or copy based on the type
   */
  protected async transferFileToStgBucket(file: FileUploadDetails, s3Client?: S3Client) {
    const { type } = file;

    try {
      if (type === 'OA' || type === 'UPLOAD_MODE') {
        return await this.awsS3Service.uploadFileToStgBucket(
          {
            Body: file.buffer,
            Key: file.fileAssetId,
            ContentType: type === 'OA' ? MIME_TYPE.OA : (file.mimeType as MIME_TYPE),
          },
          s3Client,
        );
      }

      return await this.awsS3Service.copyFileToStgBucket(file.fromBucket, file.fromKey, file.fileAssetId, s3Client);
    } catch (error) {
      // Consolidating 2 different AWS Exception into 1
      const errorMessage = (error as Error).message;

      throw new S3TransferException(COMPONENT_ERROR_CODE.FILE_UPLOAD, {
        fileName: file.fileAssetId,
        bucketName: this.fileSGConfigService.awsConfig.stgFileBucketName,
        awsErrorResponse: errorMessage,
      });
    }
  }

  protected sqsFileAssetInfosMapper(file: FileUploadDetails): FileAssetMetaData {
    switch (file.type) {
      case 'OA':
        return {
          fileAssetId: file.fileAssetId,
          fileName: file.name,
          fileType: FILE_TYPE.OA,
          size: file.size,
          oaCertificateId: file.oaCertificateId,
          oaCertificateHash: this.appendToOaCertificateHash(file.oaCertificateHash),
          isPasswordEncryptionRequired: file.isPasswordEncryptionRequired,
        };
      case 'UPLOAD_MODE':
      case 'COPY_MODE':
        return {
          fileAssetId: file.fileAssetId,
          fileName: file.name,
          fileType: getFileTypeFromMimeType(file.mimeType!) as FILE_TYPE, // mimeType will be as it has been validated
          size: file.size,
          isPasswordEncryptionRequired: file.isPasswordEncryptionRequired,
          encryptedAgencyPassword: file.encryptedAgencyPassword,
        };
    }
  }

  /**
   * This method append 0x to oaCertificateHash which is required for verification
   */
  protected appendToOaCertificateHash(oaCertificateHash: string) {
    return `0x${oaCertificateHash}`;
  }

  protected isUploadObjectCommandOutput(
    input: UploadObjectCommandOutput | ExtendedCopyObjectCommandOutput,
  ): input is UploadObjectCommandOutput {
    return !!(input as UploadObjectCommandOutput).key;
  }

  protected decryptSigningKey(encryptedKey: string) {
    return oaSigningKeyEncryptionTransformer.from(encryptedKey)!;
  }
}
