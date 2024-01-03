import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE, FILE_SESSION_TYPE, FileSGErrorResponse } from '@filesg/common';
import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorLogLevel } from '../constants/common.constant';

/**
 * Please refer to https://confluence.ship.gov.sg/display/FILESLG/Custom+Error+Code+Design for more info
 */
export class FileSGBaseHttpException extends HttpException {
  public errorLogLevel: ErrorLogLevel = 'error';
  public internalLog?: string;

  constructor(
    message: string | Record<string, any>,
    httpStatus: HttpStatus,
    componentErrorCode: COMPONENT_ERROR_CODE,
    exceptionErrorCode: EXCEPTION_ERROR_CODE,
  ) {
    const errorResponse: FileSGErrorResponse = {
      message,
      errorCode: `${componentErrorCode}-${exceptionErrorCode}`,
    };
    super(errorResponse, httpStatus);
  }
}

export class FileSGBaseException extends Error {
  public errorLogLevel: ErrorLogLevel = 'error';
  public internalLog?: string;
  public errorCode: string;
  public errorData?: string | string[] | Record<string, any>;

  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE, errorData?: string | string[] | Record<string, any>) {
    super(message);
    this.errorCode = `${componentErrorCode}`;
    this.errorData = errorData;
  }
}

export abstract class RetryableException {
  abstract get isRetryable(): boolean;
}

// use `type guard` method to check if an object implements `RetryableException`
export const isImplementRetryableException = (obj: any): obj is RetryableException => {
  return (obj as RetryableException).isRetryable !== undefined;
};

// =============================================================================
// Not found exception (404)
// =============================================================================
export class EntityNotFoundException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, subject: string, field: string, id?: string | number, internalLog?: string) {
    super(
      `[EntityNotFoundException] No ${subject} found with ${field} ${id ? 'of ' + id : ''}`,
      HttpStatus.NOT_FOUND,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.NOT_FOUND,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

// =============================================================================
// Internal server error exception (500)
// =============================================================================
export class ConfigException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, config: string, errors: string) {
    super(
      `[ConfigException] ${config} not found in env. ${errors}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class TransferInfoErrorException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, fileSessionId: string, internalLog?: string) {
    super(
      `[TransferInfoErrorException] Error while retrieving transfer info of ${fileSessionId} from management service`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class DownloadInfoErrorException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, fileSessionId: string, internalLog?: string) {
    super(
      `[DownloadInfoErrorException] Error while retrieving download info of ${fileSessionId} from management service`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class DeleteInfoErrorException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, fileSessionId: string) {
    super(
      `[DeleteInfoErrorException] Error while retrieving delete info of ${fileSessionId} from management service`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class UnknownFileSessionTypeException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, fileSessionType: FILE_SESSION_TYPE, objective: string) {
    super(
      `[UnknownFileSessionTypeException] Unknown file session type to ${objective}: ${fileSessionType}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class FileSessionErrorException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, fileSessionId: string, internalLog?: string) {
    super(
      `[FileSessionErrorException] Error while processing fileSession: ${fileSessionId}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class EmptyQueueMessageBodyException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, queueName: string, messageId?: string) {
    const message = messageId
      ? `Message body of ${messageId} from queue ${queueName} is empty.`
      : `Message body from queue ${queueName} is empty.`;

    super(
      `[EmptyQueueMessageBodyException] ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

// =============================================================================
// Bad request exception (400)
// =============================================================================
export class InputValidationException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: any, internalLog?: string, exceptionErrorCode?: EXCEPTION_ERROR_CODE) {
    super(
      {
        message: '[InputValidationException] Input data validation failed',
        error,
      },
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      exceptionErrorCode ?? EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class OASchemaValidationException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: any) {
    super(
      {
        message: '[OASchemaValidationException] JSON data to generate OA file failed validation',
        error,
      },
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class JSONParseException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, fileName: string, error: any) {
    super(
      {
        message: `[JSONParseException] Failed to parse the provided file ${fileName} as JSON`,
        error,
      },
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

// =============================================================================
// Unauthorized exception (401)
// =============================================================================
export class UnauthorizedRequestException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      '[UnauthorizedRequestException] Unauthorized request',
      HttpStatus.UNAUTHORIZED,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.UNAUTHORIZED,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class UserRoleErrorException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[UserRoleErrorException] Insufficient permission`,
      HttpStatus.UNAUTHORIZED,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.UNAUTHORIZED,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

// =============================================================================
// Forbidden exception (403)
// =============================================================================
/**
 * Currently forbidden exception serves 2 purposes:
 * 1. Permanently forbidden access such as insufficient rights to a resource
 * 2. Unathorized access to a request but without triggering frontend logout (specific to frontend)
 */
export class ForbiddenException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(`[ForbiddenException] Request is forbidden`, HttpStatus.FORBIDDEN, componentErrorCode, EXCEPTION_ERROR_CODE.FORBIDDEN);
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

// =============================================================================
// Timeout exception (408)
// =============================================================================
export class RequestTimeoutException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[RequestTimeoutException] Request timed out`,
      HttpStatus.REQUEST_TIMEOUT,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.REQUEST_TIMEOUT,
    );
  }
}
