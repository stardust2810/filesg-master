import { LogMethod } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, FEATURE_TOGGLE, OTP_CHANNEL, OTP_TYPE } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { add, differenceInSeconds, isFuture, isPast } from 'date-fns';
import generator from 'generate-password';

import { OtpTemplate } from '../../../common/email-template/otp.email-template';
import {
  OtpDoesNotExistException,
  OtpExpiredException,
  OtpInvalidException,
  OtpMaxVerificationCountReachedException,
} from '../../../common/filters/custom-exceptions.filter';
import {
  ContactVerificationOtpDetails,
  GenerateContactVerificationOtpDetails,
  GenerateNonSingpassRetrievalOtpDetails,
  GenerateOtpDetails,
  OtpDetails,
  VerifyContactVerificationOtpDetails,
  VerifyNonSingpassRetrivalOtpDetails,
  VerifyOtpDetails,
} from '../../../typings/common';
import { otpDataTransformer } from '../../../utils/helpers';
import { FileSGConfigService } from '../../setups/config/config.service';
import { SnsService } from '../aws/sns.service';
import { EmailService } from '../notification/email.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly awsSNSClient: SnsService,
  ) {}

  // =============================================================================
  //  Generic OTP methods
  // =============================================================================
  public async generateOtp(uuid: string, type: OTP_TYPE.CONTACT_VERIFICATION, channelType: OTP_CHANNEL, userContact: string, userName?: string | null): Promise<GenerateContactVerificationOtpDetails>; //prettier-ignore
  public async generateOtp(uuid: string, type: OTP_TYPE.NON_SINGPASS_VERIFICATION, channelType: OTP_CHANNEL, userContact: string, userName?: string | null): Promise<GenerateNonSingpassRetrievalOtpDetails>; //prettier-ignore
  @LogMethod()
  public async generateOtp(
    uuid: string,
    type: OTP_TYPE,
    channelType: OTP_CHANNEL,
    userContact: string,
    userName?: string | null,
  ): Promise<GenerateOtpDetails> {
    const currentDate = new Date();
    let newOtpSentCount = 0;
    let hasReachedOtpMaxResend = false;
    const { resendWaitSeconds, otpLength, otpExpirySeconds, redisRecordExpiryBuffer, maxAllowedOtpSendCount, toggleMock } =
      this.fileSGConfigService.otpConfig;

    const { otpKey, otpData } = await this.getOtpRecord(uuid, type, channelType);
    if (otpData) {
      this.logger.log(`Existing otp data retrieved`);
      const otpDetails = otpDataTransformer(otpData);
      const { allowResendAt, otpSentCount: currentOtpSentCount } = otpDetails;

      if (!allowResendAt || currentOtpSentCount === maxAllowedOtpSendCount) {
        this.logger.log(`OTP has reached max resend`);
        return { otpDetails, hasReachedOtpMaxResend: true, hasSentOtp: false };
      }

      if (isFuture(allowResendAt)) {
        this.logger.log(
          `OTP will only be allowed to re-sent at ${allowResendAt.toISOString()} but requested at ${currentDate.toISOString()}`,
        );
        return { otpDetails, hasReachedOtpMaxResend: false, hasSentOtp: false };
      }

      newOtpSentCount = currentOtpSentCount + 1;
      hasReachedOtpMaxResend = newOtpSentCount === maxAllowedOtpSendCount;
    }

    const otp = generator.generate({
      length: otpLength,
      numbers: true,
      uppercase: false,
      lowercase: false,
    });

    // Create / overwrite with new record
    const otpDetails: OtpDetails = {
      otp,
      verificationAttemptCount: 0,
      expireAt: add(currentDate, { seconds: otpExpirySeconds }),
      allowResendAt: hasReachedOtpMaxResend ? null : add(currentDate, { seconds: resendWaitSeconds }),
      otpSentCount: !otpData ? 1 : newOtpSentCount,
    };

    if (type === OTP_TYPE.CONTACT_VERIFICATION) {
      (otpDetails as ContactVerificationOtpDetails).contact = userContact;
    }

    if (toggleMock === FEATURE_TOGGLE.OFF) {
      this.logger.debug(`OTP send to the channel type: ${channelType}`);
      if (channelType === OTP_CHANNEL.SMS) {
        await this.awsSNSClient.sendOtpSms(userContact, otp, otpDetails.expireAt);
      } else if (channelType === OTP_CHANNEL.EMAIL) {
        await this.sendEmail(userContact, otp, otpDetails.expireAt, userName);
      }
    } else {
      this.logger.debug(`SMS AND EMAIL feature is turned off for this env`);
    }

    await this.redisService.set(
      FILESG_REDIS_CLIENT.OTP,
      otpKey,
      JSON.stringify(otpDetails),
      undefined,
      differenceInSeconds(otpDetails.expireAt, currentDate) + redisRecordExpiryBuffer,
    );

    return { otpDetails, hasReachedOtpMaxResend, hasSentOtp: true };
  }

  public async verifyOtp(uuid: string, inputOtp: string, type: OTP_TYPE.NON_SINGPASS_VERIFICATION, channelType: OTP_CHANNEL): Promise<VerifyNonSingpassRetrivalOtpDetails>; //prettier-ignore
  public async verifyOtp(uuid: string, inputOtp: string, type: OTP_TYPE.CONTACT_VERIFICATION, channelType: OTP_CHANNEL): Promise<VerifyContactVerificationOtpDetails>; //prettier-ignore
  @LogMethod()
  public async verifyOtp(uuid: string, inputOtp: string, type: OTP_TYPE, channelType: OTP_CHANNEL): Promise<VerifyOtpDetails> {
    const { maxValidationAttemptCount, maxAllowedOtpSendCount, toggleMock, mockString } = this.fileSGConfigService.otpConfig;
    const { otpKey, otpData } = await this.getOtpRecord(uuid, type, channelType);

    // Throw error if no OTP record found with the key
    if (!otpData) {
      throw new OtpDoesNotExistException(COMPONENT_ERROR_CODE.OTP_SERVICE, otpKey);
    }

    const otpDetails = otpDataTransformer(otpData);
    const { otp, verificationAttemptCount, expireAt, otpSentCount } = otpDetails;

    // Throw error if max retries reached
    if (verificationAttemptCount >= maxValidationAttemptCount) {
      throw new OtpMaxVerificationCountReachedException(COMPONENT_ERROR_CODE.OTP_SERVICE);
    }

    // Throw error if OTP expired
    if (isPast(expireAt)) {
      throw new OtpExpiredException(COMPONENT_ERROR_CODE.OTP_SERVICE);
    }

    if (toggleMock === FEATURE_TOGGLE.ON && inputOtp === mockString) {
      this.logger.log(`Feature toggle is on for otp verification.`);
      return { hasReachedBothMaxResendAndVerify: false, otpDetails };
    }

    if (inputOtp !== otp) {
      this.incrementVerificationAttemptCount(otpKey, otpDetails);
      const hasReachedMaxVerificationAttempt = verificationAttemptCount + 1 === maxValidationAttemptCount;
      const hasReachedOtpMaxResend = otpSentCount >= maxAllowedOtpSendCount;

      if (hasReachedMaxVerificationAttempt) {
        if (hasReachedOtpMaxResend) {
          return { hasReachedBothMaxResendAndVerify: true, otpDetails: null };
        }
        throw new OtpMaxVerificationCountReachedException(COMPONENT_ERROR_CODE.OTP_SERVICE);
      }

      throw new OtpInvalidException(COMPONENT_ERROR_CODE.OTP_SERVICE);
    }
    return { hasReachedBothMaxResendAndVerify: false, otpDetails };
  }

  public async getOtpRecord(uuid: string, type: OTP_TYPE, subType: string) {
    const otpKey = this.generateOtpRedisKey(uuid, type, subType);
    const otpData = await this.redisService.get(FILESG_REDIS_CLIENT.OTP, otpKey);
    return { otpKey, otpData };
  }

  public async deleteOtpRecord(uuid: string, type: OTP_TYPE, subType: string) {
    const redisKey = this.generateOtpRedisKey(uuid, type, subType);
    return await this.redisService.del(FILESG_REDIS_CLIENT.OTP, redisKey);
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private generateOtpRedisKey(uuid: string, type: OTP_TYPE, subType: string) {
    return `${uuid}-${type}-${subType}`;
  }

  private async sendEmail(email: string, otp: string, expireAt: Date, userName?: string | null) {
    const emailTitle = 'Verify your email address';
    const baseUrl = this.fileSGConfigService.systemConfig.fileSGBaseURL;
    const emailTemplate = OtpTemplate(otp, expireAt, baseUrl, userName);
    return await this.emailService.sendEmail([email], emailTitle, emailTemplate);
  }

  private async incrementVerificationAttemptCount(redisKey: string, otpDetails: OtpDetails) {
    const { verificationAttemptCount, expireAt } = otpDetails;
    const currentDate = new Date();

    await this.redisService.set(
      FILESG_REDIS_CLIENT.OTP,
      redisKey,
      JSON.stringify({
        ...otpDetails,
        verificationAttemptCount: verificationAttemptCount + 1,
      }),
      undefined,
      differenceInSeconds(expireAt, currentDate) + this.fileSGConfigService.otpConfig.redisRecordExpiryBuffer,
    );
  }
}
