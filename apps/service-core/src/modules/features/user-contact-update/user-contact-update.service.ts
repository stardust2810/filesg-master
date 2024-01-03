import { LogMethod } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, OTP_CHANNEL, OTP_TYPE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import add from 'date-fns/add';
import isFuture from 'date-fns/isFuture';

import {
  ContactUpdateBanException,
  DuplicateEmailException,
  SameEmailUpdateException,
} from '../../../common/filters/custom-exceptions.filter';
import { DB_QUERY_ERROR } from '../../../typings/common';
import { isQueryFailedErrorType } from '../../../utils/helpers';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { OtpService } from '../otp/otp.service';
import { UserService } from '../user/user.service';

@Injectable()
export class UserContactUpdateService {
  private readonly logger = new Logger(UserContactUpdateService.name);

  constructor(
    private userService: UserService,
    private readonly citizenUserEntityService: CitizenUserEntityService,
    private readonly otpService: OtpService,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  @LogMethod()
  public async sendOtp(userId: number, userContact: string, channelType: OTP_CHANNEL) {
    const { email, uuid, id, contactUpdateBannedUntil, name } = await this.citizenUserEntityService.retrieveCitizenUserById(userId);

    if (channelType === OTP_CHANNEL.EMAIL && email === userContact) {
      throw new SameEmailUpdateException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, email);
    }

    if (channelType === OTP_CHANNEL.EMAIL && (await this.userService.checkDuplicateEmail(userContact)).isDuplicate) {
      throw new DuplicateEmailException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE);
    }

    if (contactUpdateBannedUntil) {
      if (isFuture(contactUpdateBannedUntil)) {
        throw new ContactUpdateBanException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, uuid);
      } else {
        await this.citizenUserEntityService.updateCitizenUserById(id, { contactUpdateBannedUntil: null });
      }
    }

    const {
      otpDetails: { allowResendAt, expireAt },
      hasReachedOtpMaxResend,
      hasSentOtp,
    } = await this.otpService.generateOtp(uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType, userContact, name);

    return { allowResendAt, expireAt, hasReachedOtpMaxResend, hasSentOtp };
  }

  @LogMethod()
  public async verifyOtp(userId: number, inputOtp: string, channelType: OTP_CHANNEL) {
    const { uuid, id, contactUpdateBannedUntil } = await this.citizenUserEntityService.retrieveCitizenUserById(userId);

    if (contactUpdateBannedUntil) {
      if (isFuture(contactUpdateBannedUntil)) {
        throw new ContactUpdateBanException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, uuid);
      } else {
        await this.citizenUserEntityService.updateCitizenUserById(id, { contactUpdateBannedUntil: null });
      }
    }

    const { hasReachedBothMaxResendAndVerify, otpDetails } = await this.otpService.verifyOtp(
      uuid,
      inputOtp,
      OTP_TYPE.CONTACT_VERIFICATION,
      channelType,
    );

    if (hasReachedBothMaxResendAndVerify) {
      const { contactUpdateBanSeconds } = this.fileSGConfigService.otpConfig;
      await this.citizenUserEntityService.updateCitizenUserById(id, {
        contactUpdateBannedUntil: add(new Date(), { seconds: contactUpdateBanSeconds }),
      });

      throw new ContactUpdateBanException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE, uuid);
    }

    const { contact } = otpDetails;
    const dataToUpdate = channelType === OTP_CHANNEL.SMS ? { phoneNumber: contact } : { email: contact };

    try {
      await this.citizenUserEntityService.updateCitizenUserById(id, dataToUpdate);
      await this.otpService.deleteOtpRecord(uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
    } catch (error: unknown) {
      if (isQueryFailedErrorType(error, DB_QUERY_ERROR.DuplicateEntryError)) {
        await this.otpService.deleteOtpRecord(uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
        throw new DuplicateEmailException(COMPONENT_ERROR_CODE.USER_CONTACT_UPDATE_SERVICE);
      }
      throw error;
    }
  }
}
