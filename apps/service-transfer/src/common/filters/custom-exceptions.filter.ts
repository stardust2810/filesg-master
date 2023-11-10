import { AwsS3Error, FailedMove } from '@filesg/aws';
import { FileSGBaseHttpException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE, FileMoveInfoResponse } from '@filesg/common';
import { HttpStatus } from '@nestjs/common';

/**
 * Please refer to https://confluence.ship.gov.sg/display/FILESLG/Custom+Error+Code+Design for more info
 */

// =============================================================================
// Internal server error exception (500)
// =============================================================================
export class FilesFailedToUploadException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, public readonly awsS3Error: AwsS3Error[]) {
    super(
      `[FilesFailedToUploadException] Failed to upload files due to following reason. ${JSON.stringify(awsS3Error)}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MoveFilesFailureException extends FileSGBaseHttpException {
  constructor(
    componentErrorCode: COMPONENT_ERROR_CODE,
    public readonly failedMoves: FailedMove[],
    public readonly transferInfo: FileMoveInfoResponse,
  ) {
    super(
      '[MoveFilesFailureException] Error when moving files.',
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class FileDownloadErrorException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[FileDownloadErrorException] Error when downloading file`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

// =============================================================================
// Bad request exception (400)
// =============================================================================
export class MissingS3FileException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, missingFiles: Array<{ bucketName: string; key: string }>) {
    super(
      `[MissingS3FileException] Missing files in S3. Files ${JSON.stringify(missingFiles)} cannot be found.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
  }
}

export class FileSizeException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[FileSizeException] Unable to determine file size`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class InvalidChecksumException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, fileNames: string[]) {
    super(
      `[InvalidChecksumException] Invalid checksum. Files ${fileNames.join(
        ',',
      )} uploaded does not match the checksum provided during transaction creation.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class UnsupportedFileTypeException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, unsupportedTypeFileNames: string[], internalLog?: string) {
    super(
      {
        message: `[UnsupportedFileTypeException] The files provided contains unsupported file types: ${unsupportedTypeFileNames.join(
          ', ',
        )}`,
        unsupportedTypeFileNames,
      },
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.FILE_UPLOAD_FAILED,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class UploadFileMismatchException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[UploadFileMismatchException] Transaction files do not match uploaded files`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.internalLog = internalLog;
  }
}

export class DuplicateFileNameException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[DuplicateFileNameException] The file names provided contains duplicate names`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
  }
}

export class NonZipFileAgencyPasswordException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[NonZipFileAgencyPasswordException] agencyPassword should only be defined for zip files`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
  }
}
