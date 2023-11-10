import { FileSGBaseException, FileSGBaseHttpException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE } from '@filesg/common';
import { HttpStatus } from '@nestjs/common';

import { AwsS3Error } from '../../typings/common.typing';
import { FailedMove } from '../../typings/s3.typing';

export type AWSOperationLiterals = AWSS3OperationLiterals;
export type AWSS3OperationLiterals = 'DELETE_ALL_FILES_VERSIONS' | 'LIST_OBJECT_VERSIONS' | 'GET_OBJECT_METADATA' | 'HEAD_OBJECT';

export type AWSExceptionErrorData = {
  metadata: Record<string, any>;
  operation: AWSOperationLiterals;
};

export class AWSException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, errorMessage: string, errorData: AWSExceptionErrorData) {
    super(`[AWSException] Error: ${errorMessage}`, componentErrorCode, { ...errorData, errorMessage });
  }
}
export class AWSHttpException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, err: string, public readonly metadata?: { [key: string]: any }) {
    super(
      `[AWSException] Error when executing AWS command: ${err}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

// =============================================================================
// S3
// =============================================================================
export class AWSS3UploadException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, public readonly awsS3Error: AwsS3Error) {
    super(
      `[AWSS3UploadException] Failed to upload file (${awsS3Error.fileName} to s3 bucket(${awsS3Error.bucketName}). ${awsS3Error.awsErrorResponse}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MoveFilesFailureException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, public readonly failedMoves: FailedMove[]) {
    super(
      '[MoveFilesFailureException] Error when moving files.',
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

// =============================================================================
//
// =============================================================================
export class AwsSmGetSecretException extends AWSHttpException {
  constructor(key: string) {
    super(COMPONENT_ERROR_CODE.SECRET_MANAGER_SERVICE, `[SMGetSecretException] Expecting the value for key: ${key} to be not empty`);
  }
}
