import { ErrorLogLevel, FileSGBaseException, FileSGBaseHttpException, InputValidationException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE, TRANSACTION_TYPE, USER_TYPE } from '@filesg/common';
import { HttpStatus } from '@nestjs/common';

import { DuplicateEserviceWhitelistedUsersAgencyEserviceDetails, InvalidEserviceWhitelistedUserEmailsDetails } from '../../typings/common';

/**
 * Please refer to https://confluence.ship.gov.sg/display/FILESLG/Custom+Error+Code+Design for more info
 */

// =============================================================================
// Internal server error exception (500)
// =============================================================================
export class DatabaseException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, operation: string, entityName: string, internalLog?: string) {
    super(
      `[DatabaseException] Error when ${operation} ${entityName}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class MyInfoException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, uinfin: string, errorLogLevel: ErrorLogLevel, internalLog?: string) {
    super(
      `[MyInfoException] Failed to retrieve user info for uinfin: ${uinfin}.`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
    this.errorLogLevel = errorLogLevel;
  }
}

export class UnknownTransactionTypeException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, transactionType: TRANSACTION_TYPE) {
    super(
      `[UnknownTransactionTypeException] Failed to process unknown transaction type: ${transactionType}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class AuthDecoratorMissingException extends FileSGBaseHttpException {
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, handlerName: string, controllerName: string) {
    super(
      `[AuthDecoratorMissingException] Auth decorator is not set on handler [${handlerName} - ${controllerName}]`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class RevokeTransactionEmailFailedException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, transactionUuid: string, fileAssetUuids: string[], internalLog?: string) {
    super(
      `[RevokeTransactionEmailFailedException] The revoke transaction is successful. The emails, however, have failed to send.
      revokeTransactionUuid: ${transactionUuid}
      revokedFileAssetUuids: ${fileAssetUuids.join(', ')}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class UnsupportedUserException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, userType: USER_TYPE) {
    super(
      `[UnsupportedUserException] User type of ${userType} is not supported for this function.`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class CirisPhotoException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string, internalLog?: string) {
    super(
      `[CirisPhotoException] CIRIS photo API error: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}
export class CirisResponseEmptyException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string) {
    super(
      `[CirisResponseEmptyException] ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class CirisTokenRetrievalException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string) {
    super(
      `[CirisTokenRetrievalException] CIRIS token retrieval API error: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MyIcaDologinException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string) {
    super(
      `[MyIcaDologinException] MyICA DoLogin API error: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MccApiException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string, isWarn = false) {
    super(
      `[MccApiException] MCC API error: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.errorLogLevel = isWarn ? 'warn' : 'error';
  }
}

export class ReportGenerationException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, reportName: string, error: string) {
    super(
      `[ReportGenerationException] Failed to generate ${reportName} report: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
  }
}

// =============================================================================
// Bad request exception (400)
// =============================================================================
export class EmailInBlackListException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, blackListedEmails: string[]) {
    const emails = Array.from(new Set(blackListedEmails));

    super(
      `[EmailInBlackListException] The following email${emails.length > 1 ? 's' : ''}: ${emails.join(
        ', ',
      )} belong to a blacklist. Please provide an alternative email address for the above mentioned.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class DuplicateFileNameException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[DuplicateFileNameException] The file names provided contains duplicate names. Please provide unique names for each file.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class DuplicateEmailException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[DuplicateEmailException] The following email has already been used. Please provide an alternative email address for the above mentioned.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.DUPLICATE_EMAIL,
    );
    this.errorLogLevel = 'warn';
  }
}

export class DuplicateEserviceWhitelistedUserException extends FileSGBaseHttpException {
  constructor(
    componentErrorCode: COMPONENT_ERROR_CODE,
    duplicateEserviceWhitelistedUsersDetailsList: DuplicateEserviceWhitelistedUsersAgencyEserviceDetails[],
  ) {
    super(
      {
        error: `[DuplicateEserviceWhitelistedUserException] Duplicate eserviceWhitelistedUser email(s) provided.`,
        duplicateEserviceWhitelistedUsersDetailsList,
      },
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class InvalidEserviceWhitelistedUserEmailsException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, invalidEmailsDetails: InvalidEserviceWhitelistedUserEmailsDetails) {
    super(
      {
        error: `[InvalidEserviceWhitelistedUserEmailsException] Email(s) provided are invalid.`,
        invalidEmailsDetails,
      },
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class OtpDoesNotExistException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, key: string) {
    super(
      `[OtpDoesNotExistException] OTP record does not exist for key of: ${key}.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.OTP_DOES_NOT_EXIST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class OtpMaxRetriesReachedException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[OtpMaxRetriesReachedException] Max retries reached for this OTP. Please trigger a new OTP resend.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.OTP_MAX_RETRIES_REACHED,
    );
    this.errorLogLevel = 'warn';
  }
}

export class OtpExpiredException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(`[OtpExpiredException] OTP has expired.`, HttpStatus.BAD_REQUEST, componentErrorCode, EXCEPTION_ERROR_CODE.OTP_EXPIRED);
    this.errorLogLevel = 'warn';
  }
}

export class OtpInvalidException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(`[OtpInvalidException] Input OTP is invalid.`, HttpStatus.BAD_REQUEST, componentErrorCode, EXCEPTION_ERROR_CODE.OTP_INVALID);
    this.errorLogLevel = 'warn';
  }
}

export class SameEmailUpdateException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, email: string) {
    super(
      `[SameEmailUpdateException] The user email is already ${email}. There is no need to update.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.SAME_EMAIL_UPDATE,
    );
    this.errorLogLevel = 'warn';
  }
}

export class CirisPhotoOaInvalidException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[CirisPhotoOaInvalidException] The OA provided is invalid.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.PHOTO_RETRIEVAL_OA_INVALID,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class InvalidOaDocumentException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[InvalidOaDocumentException] The OA document provided is invalid.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class UserAlreadyOnboardedException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[UserAlreadyOnboardedException] User is already onboarded.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class UserInfoFailedToUpdateException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[UserInfoFailedToUpdateException] User info retrived failed to be updated in DB`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class ActivityAcknowledgementNotRequiredException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, activityUuid: string) {
    super(
      `[ActivityAcknowledgementNotRequiredException] Activity ${activityUuid} does not require acknowledgement.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class ActivityHadAlreadyBeenAcknowledgedException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, activityUuid: string) {
    super(
      `[ActivityHadAlreadyBeenAcknowledgedException] Activity ${activityUuid} had already been acknowledged.`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.ACTIVITY_HAD_ALREADY_BEEN_ACKNOWLEDGED,
    );
    this.errorLogLevel = 'warn';
  }
}

export class ActivityNotBannedException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, activityUuid: string, stage: '1fa' | '2fa', reason?: string) {
    super(
      `[ActivityNotBannedException] Activity ${activityUuid} is not banned for ${stage}. ${reason ?? ''}`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.BAD_REQUEST,
    );
    this.errorLogLevel = 'warn';
  }
}

export class RecalledActivityException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, activityUuid: string) {
    super(
      `[RecalledActivityException] Activity with UUID:${activityUuid} has already been recalled`,
      HttpStatus.BAD_REQUEST,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.ACTIVITY_HAD_ALREADY_BEEN_ACKNOWLEDGED,
    );
    this.errorLogLevel = 'warn';
  }
}
// =============================================================================
// Unauthorized exception (401)
// =============================================================================
export class InvalidSessionException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(`[InvalidSessionException] Invalid session`, HttpStatus.UNAUTHORIZED, componentErrorCode, EXCEPTION_ERROR_CODE.UNAUTHORIZED);
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class DuplicateSessionException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, internalLog?: string) {
    super(
      `[DuplicateSessionException] Duplicate session found for user`,
      HttpStatus.FORBIDDEN,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.DUPLICATE_SESSION,
    );
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class CSRFException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string, internalLog?: string) {
    super(`[CSRFException] CSRF Token exception: ${error}`, HttpStatus.UNAUTHORIZED, componentErrorCode, EXCEPTION_ERROR_CODE.UNAUTHORIZED);
    this.errorLogLevel = 'warn';
    this.internalLog = internalLog;
  }
}

export class SingpassNonceMatchError extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[SingpassNonceMatchError] Failed to match the nonce provided inside payload`,
      HttpStatus.UNAUTHORIZED,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.UNAUTHORIZED,
    );
  }
}

// =============================================================================
// Forbidden exception (403)
// =============================================================================
export class NonSingpassVerificationInvalidCredentialException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(
      `[NonSingpassVerificationInvalidCredentialException] Invalid Credential`,
      HttpStatus.FORBIDDEN,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.NON_SINGPASS_VERIFICATION_INVALID_CREDENTIAL,
    );
    this.errorLogLevel = 'warn';
  }
}

export class NonSingpassVerificationBanException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, activityUuid: string) {
    super(
      `[NonSingpassVerificationBanException] Activity ${activityUuid} is banned from performing any further non singpass verfication`,
      HttpStatus.FORBIDDEN,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.NON_SINGPASS_VERIFICATION_BAN,
    );
    this.errorLogLevel = 'warn';
  }
}

export class ContactUpdateBanException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, userUuid: string) {
    super(
      `[ContactUpdateBanException] User ${userUuid} is banned from performing any further contact update`,
      HttpStatus.FORBIDDEN,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.CONTACT_UPDATE_BAN,
    );
    this.errorLogLevel = 'warn';
  }
}

export class JwtExpiredException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE) {
    super(`[JwtExpiredException] JWT has expired`, HttpStatus.FORBIDDEN, componentErrorCode, EXCEPTION_ERROR_CODE.JWT_EXPIRED);
    this.errorLogLevel = 'warn';
  }
}

// =============================================================================
// Not found exception (404)
// =============================================================================

// =============================================================================
// Timeout exception (408)
// =============================================================================

// =============================================================================
// Other exceptions
// =============================================================================
// FIXME: review error code and message
export class IssuanceEmailClassNotFoundException extends InputValidationException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, issuanceEmailType: string) {
    super(componentErrorCode, `[IssuanceEmailClassNotFoundException] Issuance email class not found of type ${issuanceEmailType}`);
  }
}

export class UnsupportedTransactionTypeException extends InputValidationException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, transactionType: TRANSACTION_TYPE) {
    super(componentErrorCode, `[UnsupportedTransactionTypeException] Transaction type not supported: ${transactionType}`);
  }
}

export class RecipientInfoMissingExpection extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, acitivityId: string) {
    super(
      `[RecipientInfoMissingExpection] Failed to send email send for activity: ${acitivityId} as recipient info is null`,
      componentErrorCode,
    );
  }
}

export class UnsupportedNotificationChannelException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, notificationChannel: string) {
    super(`[UnsupportedNotificationChannelException] Notification channel is not supported: ${notificationChannel}`, componentErrorCode);
  }
}
