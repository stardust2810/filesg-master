import { OTP_CHANNEL, OTP_TYPE, STATUS } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ContactUpdateBanException,
  DuplicateEmailException,
  SameEmailUpdateException,
  UnsupportedUserException,
} from '../../../../common/filters/custom-exceptions.filter';
import { mockUserEntityService } from '../../../entities/user/__mocks__/user.entity.service.mock';
import { createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { UserEntityService } from '../../../entities/user/user.entity.service';
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
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: OtpService, useValue: mockOtpService },
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

      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockCitizenUser);
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
      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockCitizenUser);

      await expect(service.sendOtp(mockCitizenUser.id, mockCitizenUser.email!, OTP_CHANNEL.EMAIL)).rejects.toThrowError(
        SameEmailUpdateException,
      );
    });

    it('should throw DuplicateEmailException when email to be updated is alredy used by other user', async () => {
      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockCitizenUser);
      mockUserService.checkDuplicateEmail.mockResolvedValueOnce({ isDuplicate: true });

      await expect(service.sendOtp(mockCitizenUser.id, 'new-email@gmail.com', OTP_CHANNEL.EMAIL)).rejects.toThrowError(
        DuplicateEmailException,
      );
    });

    it('should throw ContactUpdateBanException when user is banned from any further contact update', async () => {
      const mockBannedCitizenUser = { ...mockCitizenUser, isBannedFromContactUpdate: true };
      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockBannedCitizenUser);
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

      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockCitizenUser);
      mockOtpService.verifyOtp.mockResolvedValueOnce({ hasReachedBothMaxResendAndVerify: false, otpDetails: mockRedisOtpDetails });

      await service.verifyOtp(mockCitizenUser.id, inputOtp, channelType);

      expect(mockOtpService.verifyOtp).toBeCalledWith(mockCitizenUser.uuid, inputOtp, OTP_TYPE.CONTACT_VERIFICATION, channelType);
      expect(mockUserEntityService.updateUserById).toBeCalledWith(mockCitizenUser.id, { email: mockRedisOtpDetails.contact });
      expect(mockOtpService.deleteOtpRecord).toBeCalledWith(mockCitizenUser.uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
    });

    it('should verify, update the user phoneNumber, and delete the otp record from redis when channel is of type sms', async () => {
      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.SMS;
      const mockMobileToBeUpdated = '+6588881234';

      const mockRedisOtpDetailsWithMobileContact = { ...mockRedisOtpDetails, contact: mockMobileToBeUpdated };
      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockCitizenUser);
      mockOtpService.verifyOtp.mockResolvedValueOnce({
        hasReachedBothMaxResendAndVerify: false,
        otpDetails: mockRedisOtpDetailsWithMobileContact,
      });

      await service.verifyOtp(mockCitizenUser.id, inputOtp, channelType);

      expect(mockOtpService.verifyOtp).toBeCalledWith(mockCitizenUser.uuid, inputOtp, OTP_TYPE.CONTACT_VERIFICATION, channelType);
      expect(mockUserEntityService.updateUserById).toBeCalledWith(mockCitizenUser.id, {
        phoneNumber: mockRedisOtpDetailsWithMobileContact.contact,
      });
      expect(mockOtpService.deleteOtpRecord).toBeCalledWith(mockCitizenUser.uuid, OTP_TYPE.CONTACT_VERIFICATION, channelType);
    });

    it('should verify, and update the user isBannedFromContactUpdate column to true when the otp verification failed and hit configured limits', async () => {
      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.EMAIL;

      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockCitizenUser);
      mockOtpService.verifyOtp.mockResolvedValueOnce({ hasReachedBothMaxResendAndVerify: true });

      await expect(service.verifyOtp(mockCitizenUser.id, inputOtp, channelType)).rejects.toThrowError(ContactUpdateBanException);
      expect(mockUserEntityService.updateUserById).toBeCalledWith(mockCitizenUser.id, { isBannedFromContactUpdate: true });
    });

    it('should throw UnsupportedUserException when user retrieved is of type programmatic', async () => {
      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.EMAIL;
      const mockInvalidUser = createMockProgrammaticUser({
        id: 1,
        uuid: 'mockProgrammaticUser-uuid-1',
        status: STATUS.ACTIVE,
        clientId: 'clientId-1',
        clientSecret: 'secret',
      });

      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockInvalidUser);
      await expect(service.verifyOtp(mockCitizenUser.id, inputOtp, channelType)).rejects.toThrowError(UnsupportedUserException);
    });

    it('should throw ContactUpdateBanException when user is banned from any further contact update', async () => {
      const inputOtp = '123456';
      const channelType = OTP_CHANNEL.EMAIL;
      const mockBannedCitizenUser = { ...mockCitizenUser, isBannedFromContactUpdate: true };
      mockUserEntityService.retrieveUserById.mockResolvedValueOnce(mockBannedCitizenUser);

      await expect(service.verifyOtp(mockCitizenUser.id, inputOtp, channelType)).rejects.toThrowError(ContactUpdateBanException);
    });
  });
});
