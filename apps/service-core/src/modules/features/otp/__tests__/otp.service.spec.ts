import { ACTIVITY_STATUS, ACTIVITY_TYPE, OTP_CHANNEL, OTP_TYPE } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';
import { add, differenceInSeconds, sub } from 'date-fns';

import {
  OtpDoesNotExistException,
  OtpExpiredException,
  OtpInvalidException,
  OtpMaxRetriesReachedException,
} from '../../../../common/filters/custom-exceptions.filter';
import { OtpDetails } from '../../../../typings/common';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockSnsService } from '../../aws/__mocks__/sns.service.mock';
import { SnsService } from '../../aws/sns.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import { OtpService } from '../otp.service';

const mockActivityUuid = 'activity-uuid-1';
const mockMobileNumber = '+6581235678';

const mockReceiveTransferActivity = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: {
    name: 'Jay Chou',
    dob: '1995-08-08',
    mobile: '+6581234567',
    email: 'jaychou95@gmail.com',
    failedAttempts: 0,
  },
});

const mockOtpDetails: OtpDetails = {
  otp: '123456',
  verificationAttemptCount: 0,
  expireAt: add(new Date(), { seconds: mockFileSGConfigService.otpConfig.otpExpirySeconds }),
  allowResendAt: add(new Date(), { seconds: mockFileSGConfigService.otpConfig.resendWaitSeconds }),
  totalOTPSentPerCycleCount: 0,
};

describe('OTP Service', () => {
  let service: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: SnsService, useValue: mockSnsService },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOtp', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date());
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should generate new otp, send sms and set new otp to redis if there is no existing otp in redis', async () => {
      mockActivityEntityService.retrieveActivityByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);

      const response = await service.generateOtp(mockActivityUuid, OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS, mockMobileNumber);

      expect(mockFileSGRedisService.get).toBeCalledTimes(1);
      expect(mockSnsService.sendOtpSms).toBeCalledTimes(1);
      expect(mockFileSGRedisService.set).toBeCalledTimes(1);
      expect(response).toHaveProperty('otpDetails');
      expect(response).toHaveProperty('hasReachedOtpMaxResend', false);
      expect(response).toHaveProperty('hasSentOtp', true);
    });

    it('should generate new otp, send email and set new otp to redis if there is no existing otp in redis', async () => {
      mockActivityEntityService.retrieveActivityByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);

      const response = await service.generateOtp(mockActivityUuid, OTP_TYPE.CONTACT_VERIFICATION, OTP_CHANNEL.EMAIL, mockMobileNumber);

      expect(mockFileSGRedisService.get).toBeCalledTimes(1);
      expect(mockEmailService.sendEmail).toBeCalledTimes(1);
      expect(mockFileSGRedisService.set).toBeCalledTimes(1);
      expect(response).toHaveProperty('otpDetails');
      expect(response).toHaveProperty('hasReachedOtpMaxResend', false);
      expect(response).toHaveProperty('hasSentOtp', true);
    });

    it('should return hasReachedOtpMaxResend as true and not sending sms when allowedResentAt is null', async () => {
      const variedOtpDetails: OtpDetails = { ...mockOtpDetails, allowResendAt: null };
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(variedOtpDetails));

      const response = await service.generateOtp(mockActivityUuid, OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS, mockMobileNumber);
      expect(mockSnsService.sendOtpSms).not.toBeCalled();
      expect(response).toHaveProperty('otpDetails');
      expect(response).toHaveProperty('hasReachedOtpMaxResend', true);
      expect(response).toHaveProperty('hasSentOtp', false);
    });

    it('should return hasReachedOtpMaxResend as true and not sending sms when total otp sent has reached max allowed otp sent', async () => {
      const { maxAllowedOtpSentPerCycle } = mockFileSGConfigService.otpConfig;
      const variedOtpDetails: OtpDetails = { ...mockOtpDetails, totalOTPSentPerCycleCount: maxAllowedOtpSentPerCycle };
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(variedOtpDetails));

      const response = await service.generateOtp(mockActivityUuid, OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS, mockMobileNumber);
      expect(mockSnsService.sendOtpSms).not.toBeCalled();
      expect(response).toHaveProperty('otpDetails');
      expect(response).toHaveProperty('hasReachedOtpMaxResend', true);
      expect(response).toHaveProperty('hasSentOtp', false);
    });

    it('should return hasReachedOtpMaxResend and hasSentOtp as false and not sending sms when current time is still less than allowResendAt', async () => {
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(mockOtpDetails));

      const response = await service.generateOtp(mockActivityUuid, OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS, mockMobileNumber);
      expect(mockSnsService.sendOtpSms).not.toBeCalled();
      expect(response).toHaveProperty('otpDetails');
      expect(response).toHaveProperty('hasReachedOtpMaxResend', false);
      expect(response).toHaveProperty('hasSentOtp', false);
    });
  });

  describe('verifyOtp', () => {
    it('should return isOtpMatched as true when both the subject otp in redis matches the input otp', async () => {
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(mockOtpDetails));

      const response = await service.verifyOtp(mockActivityUuid, '123456', OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS);

      expect(mockFileSGRedisService.get).toBeCalledTimes(1);
      expect(response).toHaveProperty('hasReachedBothMaxResendAndVerify', false);
      expect(response).toHaveProperty('otpDetails', mockOtpDetails);
    });

    it('should throw OtpDoesNotExistException when there is no otp redis record found for the subject uuid', async () => {
      await expect(service.verifyOtp(mockActivityUuid, '123456', OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS)).rejects.toThrow(
        OtpDoesNotExistException,
      );
    });

    it('should throw OtpMaxRetriesReachedException when verfication attempt has reached max retries allowed', async () => {
      const variedOtpDetails = { ...mockOtpDetails, verificationAttemptCount: mockFileSGConfigService.otpConfig.maxValidationAttemptCount };
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(variedOtpDetails));

      await expect(service.verifyOtp(mockActivityUuid, '123456', OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS)).rejects.toThrow(
        OtpMaxRetriesReachedException,
      );
    });

    it('should throw OtpExpiredException when the otp has expired', async () => {
      const variedOtpDetails = { ...mockOtpDetails, expireAt: sub(new Date(), { days: 1 }) };
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(variedOtpDetails));

      await expect(service.verifyOtp(mockActivityUuid, '123456', OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS)).rejects.toThrow(
        OtpExpiredException,
      );
    });

    it('should increase the verfication attempt count and throw OtpInvalidException when the otps do not match', async () => {
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(mockOtpDetails));

      await expect(service.verifyOtp(mockActivityUuid, '654321', OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS)).rejects.toThrow(
        OtpInvalidException,
      );
      expect(mockFileSGRedisService.set).toBeCalledTimes(1);
      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.OTP,
        `${mockActivityUuid}-${OTP_TYPE.NON_SINGPASS_VERIFICATION}-${OTP_CHANNEL.SMS}`,
        JSON.stringify({ ...mockOtpDetails, verificationAttemptCount: mockOtpDetails.verificationAttemptCount + 1 }),
        undefined,
        differenceInSeconds(mockOtpDetails.expireAt, new Date()) + mockFileSGConfigService.otpConfig.redisRecordExpiryBuffer,
      );
    });

    it('should return hasReachedBothMaxResendAndVerify as true when the otp has reaches both max otp send and verification attempt on last invalid attempt', async () => {
      const { maxAllowedOtpSentPerCycle, maxValidationAttemptCount } = mockFileSGConfigService.otpConfig;
      const variedOtpDetails = {
        ...mockOtpDetails,
        verificationAttemptCount: maxValidationAttemptCount - 1,
        totalOTPSentPerCycleCount: maxAllowedOtpSentPerCycle,
      };
      mockFileSGRedisService.get.mockResolvedValueOnce(JSON.stringify(variedOtpDetails));

      const response = await service.verifyOtp(mockActivityUuid, '654321', OTP_TYPE.NON_SINGPASS_VERIFICATION, OTP_CHANNEL.SMS);
      expect(response).toHaveProperty('hasReachedBothMaxResendAndVerify', true);
    });
  });
});
