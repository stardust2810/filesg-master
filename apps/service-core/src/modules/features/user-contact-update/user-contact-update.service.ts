import { LogMethod } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, OTP_CHANNEL, OTP_TYPE, USER_TYPE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import {
  ContactUpdateBanException,
  DuplicateEmailException,
  SameEmailUpdateException,
  UnsupportedUserException,
} from '../../../common/filters/custom-exceptions.filter';
import { ContactVerificationOtpDetails, DB_QUERY_ERROR } from '../../../typings/common';
import { isQueryFailedErrorType } from '../../../utils/helpers';
import { UserEntityService } from '../../entities/user/user.entity.service';
import { OtpService } from '../otp/otp.service';
import { UserService } from '../user/user.service';

@Injectable()
export class UserContactUpdateService {
  private readonly logger = new Logger(UserContactUpdateService.name);

  constructor(
    private userService: UserService,
    private readonly userEntityService: UserEntityService,
    private readonly otpService: OtpService,
  ) {}

  @LogMethod()
  public async sendOtp(userId: number, userContact: string, channelType: OTP_CHANNEL) {
    const user = await this.userEntityService.retrieveUserById(userId);

    if (channelType === OTP_CHANNEL.EMAIL && user.email === userContact) {
      throw new SameEmailUpdateException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, user.email);
    }

    if (channelType === OTP_CHANNEL.EMAIL && (await this.userService.checkDuplicateEmail(userContact)).isDuplicate) {
      throw new DuplicateEmailException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE);
    }

    if (user.isBannedFromContactUpdate) {
      throw new ContactUpdateBanException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, user.uuid);
    }

    const {
      otpDetails: { allowResendAt, expireAt },
      hasReachedOtpMaxResend,
      hasSentOtp,
    } = await this.otpService.generateOtp(user.uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType, userContact, user.name);

    return { allowResendAt, expireAt, hasReachedOtpMaxResend, hasSentOtp };
  }

  @LogMethod()
  public async verifyOtp(userId: number, inputOtp: string, channelType: OTP_CHANNEL) {
    const user = await this.userEntityService.retrieveUserById(userId);

    if (user.type === USER_TYPE.PROGRAMMATIC) {
      throw new UnsupportedUserException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, user.type);
    }

    if (user.isBannedFromContactUpdate) {
      throw new ContactUpdateBanException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, user.uuid);
    }

    const { hasReachedBothMaxResendAndVerify, otpDetails } = await this.otpService.verifyOtp(
      user.uuid,
      inputOtp,
      OTP_TYPE.CONTACT_VERIFICATION,
      channelType,
    );

    if (hasReachedBothMaxResendAndVerify) {
      await this.userEntityService.updateUserById(user.id, { isBannedFromContactUpdate: true });
      throw new ContactUpdateBanException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, user.uuid);
    }

    const { contact } = otpDetails as ContactVerificationOtpDetails;
    const dataToUpdate = channelType === OTP_CHANNEL.SMS ? { phoneNumber: contact } : { email: contact };

    try {
      await this.userEntityService.updateUserById(user.id, dataToUpdate);
      await this.otpService.deleteOtpRecord(user.uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
    } catch (error: unknown) {
      if (isQueryFailedErrorType(error, DB_QUERY_ERROR.DuplicateEntryError)) {
        await this.otpService.deleteOtpRecord(user.uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
        throw new DuplicateEmailException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE);
      }
      throw error;
    }
  }
}
