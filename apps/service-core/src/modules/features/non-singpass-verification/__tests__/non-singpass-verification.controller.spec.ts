import { OTP_CHANNEL, Verify1FaNonSingpassRequest, Verify2FaOtpNonSingpassRequest } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { NonSingpass2FaRequest } from '../../../../typings/common';
import { mockNonSingpassVerificationService } from '../__mocks__/non-singpass-verification.service.mock';
import { NonSingpassVerificationController } from '../non-singpass-verification.controller';
import { NonSingpassVerificationService } from '../non-singpass-verification.service';

const mockActivityUuid = 'activity-uuid-1';

describe('NonSingpassVerificationController', () => {
  let controller: NonSingpassVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NonSingpassVerificationController],
      providers: [
        {
          provide: NonSingpassVerificationService,
          useValue: mockNonSingpassVerificationService,
        },
      ],
    }).compile();

    controller = module.get<NonSingpassVerificationController>(NonSingpassVerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verify1Fa', () => {
    it('should be able to verify credentials for non-singpass 1fa verification', async () => {
      const mockBody: Verify1FaNonSingpassRequest = {
        activityUuid: mockActivityUuid,
        uin: '+6581234567',
        dob: '1995-01-01',
      };

      await controller.verify1Fa(mockBody);
      expect(mockNonSingpassVerificationService.verify1Fa).toBeCalledWith(mockBody.activityUuid, mockBody.uin, mockBody.dob);
    });
  });

  describe('sendOtpFor2Fa', () => {
    it('should be able to send otp for non-singpass verification', async () => {
      const mockRequest = {
        user: {
          activityUuid: mockActivityUuid,
        },
      } as NonSingpass2FaRequest;

      await controller.sendOtpFor2Fa(mockRequest, { channel: OTP_CHANNEL.SMS });
      expect(mockNonSingpassVerificationService.sendOtpFor2Fa).toBeCalledWith(mockRequest.user.activityUuid, OTP_CHANNEL.SMS);
    });
  });

  describe('verifyOtpFor2Fa', () => {
    it('should be able to verify otp for non-singpass verification', async () => {
      const mockRequest = {
        sessionID: 'mockSessionId-1',
        user: {
          activityUuid: mockActivityUuid,
        },
      } as NonSingpass2FaRequest;

      const mockBody: Verify2FaOtpNonSingpassRequest = {
        inputOtp: '123456',
      };

      await controller.verifyOtpFor2Fa(mockRequest, mockBody);
      expect(mockNonSingpassVerificationService.verifyOtpFor2Fa).toBeCalledWith(mockRequest.user.activityUuid, mockBody.inputOtp);
    });
  });
});
