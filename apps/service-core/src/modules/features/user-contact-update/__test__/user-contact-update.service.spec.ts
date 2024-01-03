import { OTP_CHANNEL, OTP_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import add from 'date-fns/add';

import {
  ContactUpdateBanException,
  DuplicateEmailException,
  SameEmailUpdateException,
} from '../../../../common/filters/custom-exceptions.filter';
import { mockCitizenUserEntityService } from '../../../entities/user/__mocks__/citizen-user.entity.service.mock';
import { CitizenUserEntityService } from '../../../entities/user/citizen-user.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockOtpService } from '../../otp/__mocks__/otp.service.mock';
import { OtpService } from '../../otp/otp.service';
import { mockUserService } from '../../user/__mocks__/user.service.mock';
import { UserService } from '../../user/user.service';
import { mockCitizenUser, mockContactToBeUpdated, mockRedisOtpDetails } from '../__mocks__/user-contact-update.service.mock';
import { UserContactUpdateService } from '../user-contact-update.service';

describe('UserContactUpdateService', () => {
  let service: UserContactUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserContactUpdateService,
        { provide: UserService, useValue: mockUserService },
        { provide: CitizenUserEntityService, useValue: mockCitizenUserEntityService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    service = module.get<UserContactUpdateService>(UserContactUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should generate otp, send sms and response with allowResendAt, expireAt, hasReachedOtpMaxResend and hasSentOtp when activityUuid from jwt is valid', async () => {
      const mockGenerateOtpResult = {
        otpDetails: mockRedisOtpDetails,
        hasReachedOtpMaxResend: false,
        hasSentOtp: true,
      };

      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockCitizenUser);
      mockOtpService.generateOtp.mockResolvedValueOnce(mockGenerateOtpResult);
      mockUserService.checkDuplicateEmail.mockResolvedValueOnce({ isDuplicate: mockCitizenUser.email === mockContactToBeUpdated });

      const response = await service.sendOtp(mockCitizenUser.id, mockContactToBeUpdated, OTP_CHANNEL.EMAIL);
      expect(mockOtpService.generateOtp).toBeCalledWith(
        mockCitizenUser.uuid,
        OTP_TYPE.CONTACT_VERIFICATION,
        OTP_CHANNEL.EMAIL,
        mockContactToBeUpdated,
        mockCitizenUser.name,
      );
      expect(response).toHaveProperty('allowResendAt', mockRedisOtpDetails.allowResendAt);
      expect(response).toHaveProperty('expireAt', mockRedisOtpDetails.expireAt);
      expect(response).toHaveProperty('hasReachedOtpMaxResend', mockGenerateOtpResult.hasReachedOtpMaxResend);
      expect(response).toHaveProperty('hasSentOtp', mockGenerateOtpResult.hasSentOtp);
    });

    it('should throw SameEmailUpdateException when email to be updated is same as user current email', async () => {
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockCitizenUser);

      await expect(service.sendOtp(mockCitizenUser.id, mockCitizenUser.email!, OTP_CHANNEL.EMAIL)).rejects.toThrowError(
        SameEmailUpdateException,
      );
    });

    it('should throw DuplicateEmailException when email to be updated is alredy used by other user', async () => {
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockCitizenUser);
      mockUserService.checkDuplicateEmail.mockResolvedValueOnce({ isDuplicate: true });

      await expect(service.sendOtp(mockCitizenUser.id, 'new-email@gmail.com', OTP_CHANNEL.EMAIL)).rejects.toThrowError(
        DuplicateEmailException,
      );
    });

    it('should throw ContactUpdateBanException when user is banned from any further contact update', async () => {
      const mockBannedCitizenUser = { ...mockCitizenUser, contactUpdateBannedUntil: new Date('2050-01-01') };
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockBannedCitizenUser);
      mockUserService.checkDuplicateEmail.mockResolvedValueOnce({ isDuplicate: false });

      await expect(service.sendOtp(mockCitizenUser.id, 'new-email@gmail.com', OTP_CHANNEL.EMAIL)).rejects.toThrowError(
        ContactUpdateBanException,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify, update the user email, and delete the otp record from redis when channel is of type email', async () => {
      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.EMAIL;

      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockCitizenUser);
      mockOtpService.verifyOtp.mockResolvedValueOnce({ hasReachedBothMaxResendAndVerify: false, otpDetails: mockRedisOtpDetails });

      await service.verifyOtp(mockCitizenUser.id, inputOtp, channelType);

      expect(mockOtpService.verifyOtp).toBeCalledWith(mockCitizenUser.uuid, inputOtp, OTP_TYPE.CONTACT_VERIFICATION, channelType);
      expect(mockCitizenUserEntityService.updateCitizenUserById).toBeCalledWith(mockCitizenUser.id, { email: mockRedisOtpDetails.contact });
      expect(mockOtpService.deleteOtpRecord).toBeCalledWith(mockCitizenUser.uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
    });

    it('should verify, update the user phoneNumber, and delete the otp record from redis when channel is of type sms', async () => {
      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.SMS;
      const mockMobileToBeUpdated = '+6588881234';

      const mockRedisOtpDetailsWithMobileContact = { ...mockRedisOtpDetails, contact: mockMobileToBeUpdated };
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockCitizenUser);
      mockOtpService.verifyOtp.mockResolvedValueOnce({
        hasReachedBothMaxResendAndVerify: false,
        otpDetails: mockRedisOtpDetailsWithMobileContact,
      });

      await service.verifyOtp(mockCitizenUser.id, inputOtp, channelType);

      expect(mockOtpService.verifyOtp).toBeCalledWith(mockCitizenUser.uuid, inputOtp, OTP_TYPE.CONTACT_VERIFICATION, channelType);
      expect(mockCitizenUserEntityService.updateCitizenUserById).toBeCalledWith(mockCitizenUser.id, {
        phoneNumber: mockRedisOtpDetailsWithMobileContact.contact,
      });
      expect(mockOtpService.deleteOtpRecord).toBeCalledWith(mockCitizenUser.uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
    });

    it('should verify, and update the user isBannedFromContactUpdate column to true when the otp verification failed and hit configured limits', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date());

      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.EMAIL;
      const { contactUpdateBanSeconds } = mockFileSGConfigService.otpConfig;

      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockCitizenUser);
      mockOtpService.verifyOtp.mockResolvedValueOnce({ hasReachedBothMaxResendAndVerify: true });

      await expect(service.verifyOtp(mockCitizenUser.id, inputOtp, channelType)).rejects.toThrowError(ContactUpdateBanException);
      expect(mockCitizenUserEntityService.updateCitizenUserById).toBeCalledWith(mockCitizenUser.id, {
        contactUpdateBannedUntil: add(new Date(), { seconds: contactUpdateBanSeconds }),
      });

      jest.useRealTimers();
    });

    it('should throw ContactUpdateBanException when user is banned from any further contact update', async () => {
      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.EMAIL;
      const mockBannedCitizenUser = { ...mockCitizenUser, contactUpdateBannedUntil: new Date('2050-01-01') };
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValueOnce(mockBannedCitizenUser);

      await expect(service.verifyOtp(mockCitizenUser.id, inputOtp, channelType)).rejects.toThrowError(ContactUpdateBanException);
    });
  });
});
