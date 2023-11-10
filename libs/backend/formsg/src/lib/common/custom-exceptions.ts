import { FileSGBaseException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';

export class FormSgBaseException extends FileSGBaseException {
  constructor(
    message: string,
    componentErrorCode: COMPONENT_ERROR_CODE,
    public readonly isRetryable: boolean,
    errorData?: string | string[] | Record<string, any>,
  ) {
    super(message, componentErrorCode, errorData);
  }
}

export class FormSgWebhookAuthenticationError extends FileSGBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE) {
    super(`[FormSgWebhookAuthenticationError] Error when authenticating webhook: ${message}`, componentErrorCode);
    this.errorLogLevel = 'warn';
  }
}

export class FormSgDecryptionError extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(`[FormSgDecryptionError] Decryption error`, componentErrorCode);
    this.errorLogLevel = 'warn';
  }
}

// Error when the submitted formId is different from the formId expected (set in env var)
export class FormSgIdMismatchError extends FormSgBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE) {
    const isRetryable = false;
    super(`[FormSgIdMismatchError] FormId mismatch: ${message}`, componentErrorCode, isRetryable);
    this.errorLogLevel = 'error';
  }
}
