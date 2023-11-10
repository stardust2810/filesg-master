import { ValidationError } from 'class-validator';

import { SgNotifyErrorResponse } from './sg-notify.typing';

//========================================
// Constants
//========================================
export const CONTENT_TYPE = 'JWT';
export const SIGNING_ALGORITHM = 'ES256';
export const ENCRYPTION_METHOD = 'A256GCM';
export const ENCRYPTION_ALGORITHM = 'ECDH-ES+A256KW';
export const JWT_EXPIRY = '2m';
export const JWK_USE_ENC = 'enc';
export const JWK_USE_SIG = 'sig';
export const ONE_SEC_IN_MILLISECONDS = 1000;
export const REQUEST_TIMEOUT = 10 * ONE_SEC_IN_MILLISECONDS;

//========================================
// API List
//========================================
export const AUTHZ_TOKEN = '/v1/oauth2/token';
export const SEND_NOTIFICATION_REQUEST = '/v1/notification/requests';
export const GET_NOTIFICATION_STATUS = '/v1/notification/status';
export const GET_NOTIFICATION_MULTIPLE_STATUS = '/v1/notification/multiple/status';
export const SEND_MULTIPLE_NOTIFICATION_REQUEST = '/v1/notification/multiple/requests';

//========================================
// Custom Error Exceptions
//========================================
export class ValidationException extends Error {
  public readonly validtionError: Partial<ValidationError[]>;
  constructor(errorObjName: string, validtionErrorArg: ValidationError[]) {
    super(`[ValidationError] Failed to validate ${errorObjName}`);
    this.validtionError = validtionErrorArg.map((x) => {
      delete x.target;
      delete x.value;
      return x;
    });
  }
}

export class SgNotifyRequestException extends Error {
  constructor(requestName: string, public readonly requestError: SgNotifyErrorResponse) {
    super(
      `[SGNotifyRequestException]Request failed for ${requestName}. [ID:${requestError.id}][Trace:${requestError.trace_id}] ${requestError.error_description}`,
    );
  }
}
