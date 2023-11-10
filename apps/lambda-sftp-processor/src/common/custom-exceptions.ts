import { FileSGBaseException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { ValidationError } from 'class-validator';

import { SLIFT_ENCRYPTED_FILE_EXT } from '../const';

export class SftpProcessorBaseException extends FileSGBaseException {
  constructor(
    message: string,
    componentErrorCode: COMPONENT_ERROR_CODE,
    public readonly toRetryProcessing: boolean,
    errorData?: string | string[] | Record<string, any>,
  ) {
    super(message, componentErrorCode, errorData);
  }
}

// =============================================================================
// Retry-able exception
// =============================================================================
export class ProcessMessageErrorException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, additionalMessage: string, internalLog?: string) {
    super(`[ProcessMessageErrorException] Error when processing SFTP SQS message: ${additionalMessage}`, componentErrorCode, true);
    this.internalLog = internalLog;
  }
}

export class FileDownloadErrorException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(`[FileDownloadErrorException] Error when downloading sftp file`, componentErrorCode, true);
    this.internalLog = internalLog;
  }
}

export class SliftDecryptException extends SftpProcessorBaseException {
  constructor(path: string, err: Error) {
    super(
      `[SliftDecryptException] Failed to decrypt file ${path}. Due to the following error: ${err}`,
      COMPONENT_ERROR_CODE.SLIFT_SERVICE,
      true,
    );
  }
}

export class SliftCertGenerationException extends SftpProcessorBaseException {
  constructor(err: Error) {
    super(`[SliftCertGenerationException] Failed to create receiver private key.[Error]: ${err}`, COMPONENT_ERROR_CODE.SLIFT_SERVICE, true);
  }
}

export class SMGetSecretException extends SftpProcessorBaseException {
  constructor(key: string) {
    super(`[SMGetSecretException] Expecting the value for key: ${key} to be not empty`, COMPONENT_ERROR_CODE.SECRET_MANAGER_SERVICE, true);
  }
}

export class RequestTimeoutException extends SftpProcessorBaseException {
  constructor(sourceEndpoint: string, originErrorMsg: string) {
    super(
      `[RequestTimeoutException] Request timeout when calling ${sourceEndpoint} API: ${originErrorMsg}`,
      COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE,
      true,
    );
  }
}

// =============================================================================
// Non retry-able exception
// =============================================================================
export class MissingSidecarFileException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, missingFiles: string[]) {
    super(`[MissingSidecarFileException] Missing sidecar files: ${JSON.stringify(missingFiles)}`, componentErrorCode, false, missingFiles);
  }
}

export class ParsingCsvException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, errorData: { filename: string; msg: string }[]) {
    super(`[ParsingCsvException] Error parsing csv files`, componentErrorCode, false, errorData);
  }
}

export class CsvValidationException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, validationErrors: ValidationError[]) {
    super(`[CsvValidationException] Error parsing csv files`, componentErrorCode, false, validationErrors);
  }
}

export class MissingFileException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, missingFiles: string[]) {
    super(`[MissingFileException] Missing files: ${JSON.stringify(missingFiles)}`, componentErrorCode, false, missingFiles);
  }
}

export class ExtraFileException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, extraFiles: string[]) {
    super(`[ExtraFileException] Extra files: ${JSON.stringify(extraFiles)}`, componentErrorCode, false, extraFiles);
  }
}

export class ExtraFileAgencyPasswordException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, extraFiles: string[]) {
    super(
      `[ExtraFileAgencyPasswordException] Extra files: ${JSON.stringify(extraFiles)} found inside agency password sidecar data.`,
      componentErrorCode,
      false,
      extraFiles,
    );
  }
}

export class InvalidFilePathFormatAgencyPasswordException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, invalidFiles: string[]) {
    super(
      `[InvalidFilePathFormatAgencyPasswordException] Invalid file path format. No file path found under the following files: ${JSON.stringify(
        invalidFiles,
      )}`,
      componentErrorCode,
      false,
      invalidFiles,
    );
  }
}

export class DuplicateEntryAgencyPasswordException extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(`[DuplicateEntryAgencyPasswordException] Agency password file contains duplicate entry.`, componentErrorCode, false);
  }
}

export class UnsupportedFileTypeException extends SftpProcessorBaseException {
  constructor(componentErroCode: COMPONENT_ERROR_CODE, unsupportedFiles: { name: string; detectedType: string | undefined }[]) {
    super(
      `[UnsupportedFileTypeException] Unsupported files: ${JSON.stringify(unsupportedFiles)}`,
      componentErroCode,
      false,
      unsupportedFiles,
    );
  }
}

export class UploadWorkingFileToS3Exception extends SftpProcessorBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, errorData: { key: string; msg: string }[]) {
    super(`[UploadWorkingFileToS3Exception] Error uploading working files to s3`, componentErrorCode, false, errorData);
  }
}

export class SliftMissingException extends SftpProcessorBaseException {
  constructor(sliftDir: string) {
    super(
      `[SliftMissingException] Unable to locate run shell script from SLIFT under ${sliftDir}`,
      COMPONENT_ERROR_CODE.SLIFT_SERVICE,
      false,
    );
  }
}

export class SliftFileTypeException extends SftpProcessorBaseException {
  constructor() {
    super(
      `[SliftFileTypeException] File is not a slift encrypyted file as the extenstion is not ${SLIFT_ENCRYPTED_FILE_EXT}`,
      COMPONENT_ERROR_CODE.SLIFT_SERVICE,
      false,
    );
  }
}

export class CreateTransactionException extends SftpProcessorBaseException {
  constructor(originErrorMsg: string, actualErrorRes: Record<string, unknown>) {
    super(
      `[CreateTransactionException] Error when calling service-core CreateTransaction API: ${originErrorMsg}`,
      COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE,
      false,
      actualErrorRes,
    );
  }
}

export class UploadTransactionFilesException extends SftpProcessorBaseException {
  constructor(originErrorMsg: string, actualErrorRes: Record<string, unknown>) {
    super(
      `[UploadTransactionFilesException] Error when calling service-transfer UploadFile API: ${originErrorMsg}`,
      COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE,
      false,
      actualErrorRes,
    );
  }
}
