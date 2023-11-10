import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE } from '@filesg/common';
import { FormSgBaseException } from '@filesg/formsg';
import { ValidationError } from 'class-validator';

export interface EmailBlacklistedError {
  exceptionCode: EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED;
  blacklistedEmails: string[];
}

export interface DuplicateRecipientUinsError {
  exceptionCode: EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS;
  duplicatedUins: string[];
}

export interface DuplicateFileNamesError {
  exceptionCode: EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES;
  duplicatedFileNames: string[];
}

export type AdditionalCreateTransactionErrorData = EmailBlacklistedError | DuplicateRecipientUinsError | DuplicateFileNamesError;

export interface UnsupportedFileTypeError {
  exceptionCode: EXCEPTION_ERROR_CODE.FILE_UPLOAD_FAILED;
  unsupportedTypeFileNames: string[];
}

export type AdditionalUploadFileErrorData = UnsupportedFileTypeError;

export class FormSgNonRetryableCreateTransactionError extends FormSgBaseException {
  constructor(
    message: string,
    componentErrorCode: COMPONENT_ERROR_CODE,
    public readonly formSgFailSubType: string,
    public readonly additionalErrorData?: AdditionalCreateTransactionErrorData,
  ) {
    const isRetryable = false;
    super(
      `[FormSgNonRetryableCreateTransactionError] Create transaction failed with error: ${message}`,
      componentErrorCode,
      isRetryable,
      undefined,
    );
    this.errorLogLevel = 'error';
  }
}

export class FormSgNonRetryableUploadFileError extends FormSgBaseException {
  constructor(
    message: string,
    componentErrorCode: COMPONENT_ERROR_CODE,
    public readonly formSgFailSubType: string,
    public readonly additionalErrorData?: AdditionalUploadFileErrorData,
  ) {
    const isRetryable = false;
    super(`[FormSgNonRetryableUploadFileError] Upload file failed with error: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

export class FormSgNonRetryableRecallTransactionError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE) {
    const isRetryable = false;
    super(`[FormSgNonRetryableRecallTransactionError] Recall transaction failed with error: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

export class FormSgCreateTransactionError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE, public readonly formSgFailSubType: string) {
    const isRetryable = true;
    super(`[FormSgCreateTransactionError] Create transaction failed with error: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

export class FormSgUploadFileError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE, public readonly formSgFailSubType: string) {
    const isRetryable = true;
    super(`[FormSgUploadFileError] Upload file failed with error: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

export class FormSgRecallTransactionError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE) {
    const isRetryable = true;
    super(`[FormSgRecallTransactionError] Recall transaction failed with error: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

export class FormSgMessageProcessingError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE) {
    const isRetryable = false;
    super(`[FormSgMessageProcessingError] Processing error: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

// Error when sqs message attributes is missing required attribute(s)
export class MissingMessageAttributesError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE) {
    const isRetryable = false;
    super(`[MissingMessageAttributesError] Required attributes missing: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

// Error when sqs message type has no handler
export class NoHandlerError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE) {
    const isRetryable = false;
    super(`[NoHandlerError] No handler found for type: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}

// =============================================================================
// Batch issuance
// =============================================================================
export class BatchIssuancePackageZipFileException extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE, public readonly formsgFailSubType: string) {
    super(`[BatchIssuancePackageZipFileException] Error processing package zip file, error: ${message}`, componentErrorCode, false);
    this.errorLogLevel = 'warn';
  }
}

// =============================================================================
// Recall Transaction
// =============================================================================
export class RecallTransactionRequestValidationException extends FormSgBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, validationErrors: ValidationError[]) {
    super(
      `[RecallTransactionRequestValidationException] Error parsing recall transaction body`,
      componentErrorCode,
      false,
      validationErrors,
    );
    this.errorLogLevel = 'error';
  }
}
