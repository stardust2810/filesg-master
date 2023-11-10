/* eslint-disable sonarjs/no-duplicate-string */
import { ForbiddenException } from '@filesg/backend-common';
import { ACTIVITY_STATUS, ACTIVITY_TYPE, OTP_CHANNEL, OTP_TYPE, STATUS } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { add } from 'date-fns';

import {
  NonSingpassVerificationBanException,
  NonSingpassVerificationInvalidCredentialException,
} from '../../../../common/filters/custom-exceptions.filter';
import { OtpDetails } from '../../../../typings/common';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockAuditEventEntityService } from '../../../entities/audit-event/__mocks__/audit-event.entity.service.mock';
import { AuditEventEntityService } from '../../../entities/audit-event/audit-event.entity.service';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockAuthService } from '../../auth/__mocks__/auth.service.mock';
import { AuthService } from '../../auth/auth.service';
import { mockOtpService } from '../../otp/__mocks__/otp.service.mock';
import { OtpService } from '../../otp/otp.service';
import { mockAccessToken } from '../__mocks__/non-singpass-verification.service.mock';
import { NonSingpassVerificationService } from '../non-singpass-verification.service';

const mockActivityUuid = 'mockActivity-uuid-1';

const mockActivityOwner = createMockCitizenUser({
  uin: 'S1111111',
  email: 'mock@gmail.com',
  status: STATUS.ACTIVE,
});

const mockRecipientInfo = {
  name: 'The Rock',
  dob: '1995-08-18',
  mobile: '+6581235678',
  email: 'rockMePls@gmail.com',
  failedAttempts: 0,
};

const mockReceiveTransferActivity = createMockActivity({
  uuid: mockActivityUuid,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  user: mockActivityOwner,
  recipientInfo: mockRecipientInfo,
});

const mockActivityWithoutMobileInRecipientInfo = {
  ...mockReceiveTransferActivity,
  recipientInfo: {
    name: 'The Rock',
    dob: '1995-08-18',
    email: 'rockMePls@gmail.com',
  },
};

const mockInvalidActivity = createMockActivity({
  uuid: mockActivityUuid,
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.FAILED,
  user: mockActivityOwner,
});

const currentTime = new Date();
const { resendWaitSeconds, otpExpirySeconds } = mockFileSGConfigService.otpConfig;
const mockRedisOtpDetails: OtpDetails = {
  otp: '123456',
  verificationAttemptCount: 0,
  expireAt: add(currentTime, { seconds: otpExpirySeconds }),
  allowResendAt: add(currentTime, { seconds: resendWaitSeconds }),
  totalOTPSentPerCycleCount: 1,
};

describe('NonSingpassVerificationService', () => {
  let service: NonSingpassVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NonSingpassVerificationService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: AuditEventEntityService, useValue: mockAuditEventEntityService },
      ],
    }).compile();

    service = module.get<NonSingpassVerificationService>(NonSingpassVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verify1Fa', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return jwt access token with masked mobile number', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);
      mockAuthService.generateJWT.mockResolvedValue('mockJwt');

      const response = await service.verify1Fa(mockActivityUuid, 'S1111111', '1995-08-18');
      expect(mockActivityEntityService.retrieveActivityWithUserByUuid).toBeCalledTimes(1);
      expect(mockActivityEntityService.updateActivityRecipientInfo).toBeCalledTimes(1);
      expect(mockAuthService.generateJWT).toBeCalledTimes(1);
      expect(response).toEqual({ accessToken: 'mockJwt', maskedMobile: '+65****5678' });
    });

    it('should throw NonSingpassVerificationInvalidCredentialException when activity does not exist OR is not of type receive transfer OR of status completed OR has recipientInfo', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockInvalidActivity);

      await expect(service.verify1Fa(mockActivityUuid, 'S1111111', '1995-08-18')).rejects.toThrowError(
        NonSingpassVerificationInvalidCredentialException,
      );
    });

    it('should throw NonSingpassVerificationInvalidCredentialException when activity recipientInfo doesnt have mobile', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockActivityWithoutMobileInRecipientInfo);

      await expect(service.verify1Fa(mockActivityUuid, 'S1111111', '1995-08-18')).rejects.toThrowError(
        NonSingpassVerificationInvalidCredentialException,
      );
    });

    it('should throw NonSingpassVerificationInvalidCredentialException when called with invalid combination of activityId, uin and dob', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);

      await expect(service.verify1Fa(mockActivityUuid, 'S2222222', '1995-08-18')).rejects.toThrowError(
        NonSingpassVerificationInvalidCredentialException,
      );
      expect(mockActivityEntityService.updateActivityRecipientInfo).toBeCalledTimes(1);
    });

    it('should throw NonSingpassVerificationBanException when activity is already banned', async () => {
      const mockBannedActivity = { ...mockReceiveTransferActivity, isBannedFromNonSingpassVerification: true };

      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockBannedActivity);

      await expect(service.verify1Fa(mockActivityUuid, 'S1111111', '1995-08-18')).rejects.toThrowError(NonSingpassVerificationBanException);
    });

    it('should throw NonSingpassVerificationBanException when attempts is more than configured', async () => {
      const { max1FaVerificationAttemptCount } = mockFileSGConfigService.nonSingpassAuthConfig;
      mockReceiveTransferActivity.recipientInfo!.failedAttempts = max1FaVerificationAttemptCount;

      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);

      await expect(service.verify1Fa(mockActivityUuid, 'S2222222', '1995-01-01')).rejects.toThrowError(NonSingpassVerificationBanException);
    });
  });

  describe('sendOtpFor2Fa', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should generate otp, send sms and response with allowResendAt, expireAt, hasReachedOtpMaxResend and hasSentOtp when activityUuid from jwt is valid', async () => {
      const mockRedisOtpDetails: OtpDetails = {
        otp: '123456',
        verificationAttemptCount: 0,
        totalOTPSentPerCycleCount: 0,
        allowResendAt: new Date(),
        expireAt: new Date(),
      };

      const mockGenerateOtpResult = {
        otpDetails: mockRedisOtpDetails,
        hasReachedOtpMaxResend: false,
        hasSentOtp: true,
      };

      mockActivityEntityService.retrieveActivityByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);
      mockOtpService.generateOtp.mockResolvedValueOnce(mockGenerateOtpResult);

      const response = await service.sendOtpFor2Fa(mockActivityUuid);
      expect(mockOtpService.generateOtp).toBeCalledWith(
        mockActivityUuid,
        OTP_TYPE.NON_SINGPASS_VERIFICATION,
        OTP_CHANNEL.SMS,
        mockRecipientInfo.mobile,
      );
      expect(response).toHaveProperty('allowResendAt', mockRedisOtpDetails.allowResendAt);
      expect(response).toHaveProperty('expireAt', mockRedisOtpDetails.expireAt);
      expect(response).toHaveProperty('hasReachedOtpMaxResend', mockGenerateOtpResult.hasReachedOtpMaxResend);
      expect(response).toHaveProperty('hasSentOtp', mockGenerateOtpResult.hasSentOtp);
    });

    it('should throw ForbiddenException when activity retrieved is undefined or not of accepted type or not of status completed', async () => {
      mockActivityEntityService.retrieveActivityByUuid.mockResolvedValueOnce(mockInvalidActivity);

      await expect(service.sendOtpFor2Fa(mockActivityUuid)).rejects.toThrowError(ForbiddenException);
    });

    it('should throw ForbiddenException when activity recipientInfo doesnt have mobile', async () => {
      mockActivityEntityService.retrieveActivityByUuid.mockResolvedValueOnce(mockActivityWithoutMobileInRecipientInfo);

      await expect(service.sendOtpFor2Fa(mockActivityUuid)).rejects.toThrowError(ForbiddenException);
    });

    it('should throw NonSingpassVerificationBanException when the activity is banned from further verification', async () => {
      const mockBannedActivity = { ...mockReceiveTransferActivity, isBannedFromNonSingpassVerification: true };
      mockActivityEntityService.retrieveActivityByUuid.mockResolvedValueOnce(mockBannedActivity);

      await expect(service.sendOtpFor2Fa(mockActivityUuid)).rejects.toThrowError(NonSingpassVerificationBanException);
    });
  });

  describe('verifyOtpFor2Fa', () => {
    it('should verify, generate content retrieval jwt, delete otp record from redis and response with the generated jwt when activityUuid from jwt and input otp is valid', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);
      mockOtpService.verifyOtp.mockResolvedValueOnce({ hasReachedBothMaxResendAndVerify: false });
      mockAuthService.generateJWT.mockResolvedValueOnce(mockAccessToken);

      const response = await service.verifyOtpFor2Fa(mockActivityUuid, mockRedisOtpDetails.otp);

      expect(response).toHaveProperty('accessToken', 'mockAccessToken');
      expect(mockAuthService.generateJWT).toBeCalledTimes(1);
      expect(mockOtpService.deleteOtpRecord).toBeCalledTimes(1);
    });

    it('should verify, and update the activity isBannedFromNonSingpassVerification column to true when the otp verification failed and hit configured limits', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockReceiveTransferActivity);
      mockOtpService.verifyOtp.mockResolvedValueOnce({ hasReachedBothMaxResendAndVerify: true });

      await expect(service.verifyOtpFor2Fa(mockActivityUuid, mockRedisOtpDetails.otp)).rejects.toThrowError(
        NonSingpassVerificationBanException,
      );

      expect(mockActivityEntityService.updateActivity).toBeCalledWith(mockActivityUuid, { isBannedFromNonSingpassVerification: true });
    });

    it('should throw ForbiddenException when activity retrieved is undefined or not of accepted type or not of status completed', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockInvalidActivity);

      await expect(service.verifyOtpFor2Fa(mockActivityUuid, mockRedisOtpDetails.otp)).rejects.toThrowError(ForbiddenException);
    });

    it('should throw ForbiddenException when activity recipientInfo doesnt have mobile', async () => {
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockActivityWithoutMobileInRecipientInfo);

      await expect(service.verifyOtpFor2Fa(mockActivityUuid, mockRedisOtpDetails.otp)).rejects.toThrowError(ForbiddenException);
    });

    it('should throw NonSingpassVerificationBanException when the activity is banned from further verification', async () => {
      const mockBannedActivity = { ...mockReceiveTransferActivity, isBannedFromNonSingpassVerification: true };
      mockActivityEntityService.retrieveActivityWithUserByUuid.mockResolvedValueOnce(mockBannedActivity);

      await expect(service.verifyOtpFor2Fa(mockActivityUuid, mockRedisOtpDetails.otp)).rejects.toThrowError(
        NonSingpassVerificationBanException,
      );
    });

    // it('should return the required fields', async () => {
    //   const { jwtContentRetrievalTokenExpirationDurationSeconds, jwtContentRetrievalTokenWarningDurationSeconds } =
    //     mockFileSGConfigService.nonSingpassAuthConfig;
    //   // const addSecondsSpy = jest.spyOn(dateFns, 'addSeconds');

    //   mockAuthService.generateJWT.mockResolvedValueOnce(mockAccessToken);
    //   // addSecondsSpy.mockReturnValueOnce(new Date('01-01-1995'))

    //   await expect(service.verifyOtpFor2Fa(mockActivityUuid, mockRedisOtpDetails.otp, mockSessionId)).toEqual({
    //     sessionId: mockSessionId,
    //     accessToken: mockAccessToken,
    //     tokenExpiry: new Date('01-01-1995'),
    //     expiryDurationSecs: jwtContentRetrievalTokenExpirationDurationSeconds,
    //     warningDurationSecs: jwtContentRetrievalTokenWarningDurationSeconds,
    //   });
    // });
  });
});
