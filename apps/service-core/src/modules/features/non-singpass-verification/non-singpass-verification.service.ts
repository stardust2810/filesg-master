import { ForbiddenException, JWT_TYPE, LogMethod, maskEmail, maskMobile, maskUin } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  AUDIT_EVENT_NAME,
  AUTH_TYPE,
  COMPONENT_ERROR_CODE,
  OTP_CHANNEL,
  OTP_TYPE,
  RECIPIENT_ACTIVITY_TYPES,
  Verify1FaNonSingpassResponse,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { addSeconds } from 'date-fns';
import { v4 as uuid } from 'uuid';

import {
  NonSingpassRetrievalException,
  NonSingpassVerificationBanException,
  NonSingpassVerificationInvalidCredentialException,
} from '../../../common/filters/custom-exceptions.filter';
import { AuditEventCreationModel } from '../../../entities/audit-event';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { AuthService } from '../auth/auth.service';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class NonSingpassVerificationService {
  private readonly logger = new Logger(NonSingpassVerificationService.name);

  constructor(
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly auditEventEntityService: AuditEventEntityService,
  ) {}

  @LogMethod()
  public async verify1Fa(activityUuid: string, uin: string, dob: string): Promise<Verify1FaNonSingpassResponse> {
    const { max1FaVerificationAttemptCount, jwt2FATokenExpirationDuration } = this.fileSGConfigService.nonSingpassAuthConfig;

    // no throwing NOT FOUND exception to prevent caller from guessing the existence of activity uuid
    const activity = await this.activityEntityService.retrieveActivityWithUserByUuid(activityUuid, { toThrow: false });

    if (!activity || !RECIPIENT_ACTIVITY_TYPES.includes(activity.type) || activity.status !== ACTIVITY_STATUS.COMPLETED) {
      throw new NonSingpassVerificationInvalidCredentialException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE);
    }

    if (activity.isBannedFromNonSingpassVerification) {
      const internalLog = `${maskUin(uin)} is banned from non singpass verification`;
      throw new NonSingpassVerificationBanException(COMPONENT_ERROR_CODE.NON_SINGPASS_VERIFICATION_SERVICE, activityUuid, internalLog);
    }

    if (!activity.isNonSingpassRetrievable) {
      throw new NonSingpassRetrievalException(COMPONENT_ERROR_CODE.NON_SINGPASS_VERIFICATION_SERVICE, activityUuid);
    }

    const recipientInfo = activity.recipientInfo!;
    const { dob: dobFromInfo, mobile, email, failedAttempts } = recipientInfo;

    if (!mobile && !email) {
      this.logger.log(`${maskUin(uin)} no contact provided for the user to perform 2FA`);
      throw new NonSingpassVerificationInvalidCredentialException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE);
    }

    const { uin: userUin } = activity.user!;

    const isWrongDob = dob !== dobFromInfo;
    const isWrongUin = uin !== userUin;
    if (isWrongDob || isWrongUin) {
      this.logger.warn(`[verify1FaFailure] activityUuid: ${activityUuid} verify failure: ${JSON.stringify({ isWrongDob, isWrongUin })}`);

      const newFailedAttempts = failedAttempts! + 1;

      await this.activityEntityService.updateActivityRecipientInfo(activityUuid, {
        ...recipientInfo,
        failedAttempts: newFailedAttempts,
      });

      if (newFailedAttempts >= max1FaVerificationAttemptCount) {
        this.logger.log(
          `${maskUin(uin)} Total number of attempts has reached max1FaVerificationAttemptCount ${max1FaVerificationAttemptCount}`,
        );
        await this.activityEntityService.updateActivity(activityUuid, { isBannedFromNonSingpassVerification: true });
        throw new NonSingpassVerificationBanException(COMPONENT_ERROR_CODE.NON_SINGPASS_VERIFICATION_SERVICE, activityUuid);
      }

      throw new NonSingpassVerificationInvalidCredentialException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE);
    }

    await this.activityEntityService.updateActivityRecipientInfo(activityUuid, {
      ...recipientInfo,
      failedAttempts: 0,
    });

    return {
      accessToken: await this.authService.generateJWT({ activityUuid }, JWT_TYPE.NON_SINGPASS_2FA, {
        expiresIn: jwt2FATokenExpirationDuration,
      }),
      maskedMobile: mobile ? maskMobile(mobile) : undefined,
      maskedEmail: email ? maskEmail(email) : undefined,
    };
  }

  @LogMethod()
  public async sendOtpFor2Fa(activityUuid: string, channel: OTP_CHANNEL) {
    const activity = await this.activityEntityService.retrieveActivityByUuid(activityUuid, { toThrow: false });

    // Throwing forbidden exception here instead of not found exception to be in sync with exception thrown by jwt strategy when jwt content is invalid
    if (!activity || !RECIPIENT_ACTIVITY_TYPES.includes(activity.type) || activity.status !== ACTIVITY_STATUS.COMPLETED) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.OTP_SERVICE);
    }

    if (activity.isBannedFromNonSingpassVerification) {
      this.logger.log(`Activity id: ${activityUuid} is banned from non singpass verification`);
      throw new NonSingpassVerificationBanException(COMPONENT_ERROR_CODE.NON_SINGPASS_VERIFICATION_SERVICE, activityUuid);
    }

    const { recipientInfo } = activity;
    const { mobile, email } = recipientInfo!;
    const recipientContact = channel === OTP_CHANNEL.SMS ? mobile : email;

    if (!recipientContact) {
      this.logger.log(`No ${channel} was provided to perform 2FA verification`);
      throw new ForbiddenException(COMPONENT_ERROR_CODE.OTP_SERVICE);
    }

    const {
      otpDetails: { allowResendAt, expireAt },
      hasReachedOtpMaxResend,
      hasSentOtp,
    } = await this.otpService.generateOtp(activityUuid, OTP_TYPE.NON_SINGPASS_VERIFICATION, channel, recipientContact);

    return { allowResendAt, expireAt, hasReachedOtpMaxResend, hasSentOtp };
  }

  @LogMethod()
  public async verifyOtpFor2Fa(activityUuid: string, inputOtp: string) {
    const activity = await this.activityEntityService.retrieveActivityWithUserByUuid(activityUuid, { toThrow: false });

    // Throwing forbidden exception here instead of not found exception to be in sync with exception thrown by jwt strategy when jwt content is invalid
    if (!activity || !RECIPIENT_ACTIVITY_TYPES.includes(activity.type) || activity.status !== ACTIVITY_STATUS.COMPLETED) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.OTP_SERVICE);
    }

    if (activity.isBannedFromNonSingpassVerification) {
      this.logger.log(`Activity id: ${activityUuid} is banned from non singpass verification`);
      throw new NonSingpassVerificationBanException(COMPONENT_ERROR_CODE.NON_SINGPASS_VERIFICATION_SERVICE, activityUuid);
    }

    const { user, recipientInfo } = activity;
    const { mobile } = recipientInfo!;

    if (!mobile) {
      this.logger.log(`No mobile was provided to perform 2FA verification`);
      throw new ForbiddenException(COMPONENT_ERROR_CODE.OTP_SERVICE);
    }

    const { hasReachedBothMaxResendAndVerify } = await this.otpService.verifyOtp(
      activityUuid,
      inputOtp,
      OTP_TYPE.NON_SINGPASS_VERIFICATION,
      OTP_CHANNEL.SMS,
    );

    if (hasReachedBothMaxResendAndVerify) {
      this.logger.log(`Activity id: ${activityUuid} has reached both max resend and verify `);
      await this.activityEntityService.updateActivity(activityUuid, { isBannedFromNonSingpassVerification: true });
      throw new NonSingpassVerificationBanException(COMPONENT_ERROR_CODE.NON_SINGPASS_VERIFICATION_SERVICE, activityUuid);
    }

    const { jwtContentRetrievalTokenExpirationDurationSeconds, jwtContentRetrievalTokenWarningDurationSeconds } =
      this.fileSGConfigService.nonSingpassAuthConfig;

    const sessionId = uuid();
    const accessToken = await this.authService.generateJWT(
      { sessionId, activityUuid, userId: user!.id, userUuid: user!.uuid },
      JWT_TYPE.NON_SINGPASS_CONTENT_RETRIEVAL,
      { expiresIn: jwtContentRetrievalTokenExpirationDurationSeconds },
    );

    const tokenExpiry = addSeconds(new Date(), jwtContentRetrievalTokenExpirationDurationSeconds);

    await this.otpService.deleteOtpRecord(activityUuid, OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS);

    const userSessionAuditEventModel: AuditEventCreationModel = {
      eventName: AUDIT_EVENT_NAME.USER_LOGIN,
      subEventName: sessionId,
      data: { sessionId, userId: user!.id, authType: AUTH_TYPE.NON_SINGPASS, hasPerformedDocumentAction: false },
    };
    await this.auditEventEntityService.insertAuditEvents([userSessionAuditEventModel]);

    return {
      sessionId,
      accessToken,
      tokenExpiry,
      expiryDurationSecs: jwtContentRetrievalTokenExpirationDurationSeconds,
      warningDurationSecs: jwtContentRetrievalTokenWarningDurationSeconds,
    };
  }
}
