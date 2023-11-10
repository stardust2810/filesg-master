import { AwsS3Error, FailedDelete } from '@filesg/aws';
import { FileSGBaseException, FileSGBaseHttpException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE } from '@filesg/common';
import { HttpStatus } from '@nestjs/common';

export class DeleteActivityFilesErrorException extends FileSGBaseException {
  constructor(
    componentErrorCode: COMPONENT_ERROR_CODE,
    errorMessage: string,
    errorData?: string | Record<string, any> | string[] | undefined,
  ) {
    super(`[DeleteActivityFilesErrorException] Error deleting files in activity: ${errorMessage}`, componentErrorCode, errorData);
  }
}

export class FailedDeleteException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, errorMessage: string, errorData?: { failedDeletes: FailedDelete[] }) {
    super(`[FailedDeleteException] ${errorMessage}`, componentErrorCode, errorData);
  }
}

export class S3TransferException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, public readonly s3TransferError: AwsS3Error) {
    super(
      `[S3TransferException] Failed to upload/copy file (${s3TransferError.fileName} to s3 bucket(${s3TransferError.bucketName}). ${s3TransferError.awsErrorResponse}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class DeleteCopiedFilesErrorException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, errorMessage: string, bucketName: string) {
    super(`[DeleteCopiedFilesErrorException] Error deleting copied files in bucket ${bucketName}: ${errorMessage}`, componentErrorCode);
  }
}

export class AgencyOATypeMismatchException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, agency: string, oaType: string) {
    super(
      `[AgencyOATypeMismatchException] The OA type entered is invalid for this agency. OA type: ${oaType}, Agency: ${agency}`,
      componentErrorCode,
    );
  }
}
