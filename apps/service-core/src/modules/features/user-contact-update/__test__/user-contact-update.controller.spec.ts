import { OTP_CHANNEL, UserContactUpdateSendOtpRequest, UserContactUpdateVerifyOtpRequest } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RequestWithCitizenSession } from '../../../../typings/common';
import { mockUserContactUpdateService } from '../__mocks__/user-contact-update.service.mock';
import { UserContactUpdateController } from '../user-contact-update.controller';
import { UserContactUpdateService } from '../user-contact-update.service';

const mockRequest = {
  session: {
    user: {
      userId: 1,
    },
  },
} as RequestWithCitizenSession;

describe('UserContactUpdateController', () => {
  let controller: UserContactUpdateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserContactUpdateController],
      providers: [{ provide: UserContactUpdateService, useValue: mockUserContactUpdateService }],
    }).compile();

    controller = module.get<UserContactUpdateController>(UserContactUpdateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should be able to send otp with email otp channel when request email is given', async () => {
      const mockBody: UserContactUpdateSendOtpRequest = {
        email: 'mock@gmail.com',
      };

      await controller.sendOtp(mockRequest, mockBody);
      expect(mockUserContactUpdateService.sendOtp).toBeCalledWith(mockRequest.session.user.userId, mockBody.email, OTP_CHANNEL.EMAIL);
    });

    it('should be able to send otp with sms otp channel when request mobile is given', async () => {
      const mockBody: UserContactUpdateSendOtpRequest = {
        mobile: '+6581234567',
      };

      await controller.sendOtp(mockRequest, mockBody);
      expect(mockUserContactUpdateService.sendOtp).toBeCalledWith(mockRequest.session.user.userId, mockBody.mobile, OTP_CHANNEL.SMS);
    });
  });

  describe('verifyOtp', () => {
    it('should be able to verify otp for user contact update', async () => {
      const mockBody: UserContactUpdateVerifyOtpRequest = {
        inputOtp: '123456',
        channel: OTP_CHANNEL.EMAIL,
      };

      await controller.verifyOtp(mockRequest, mockBody);
      expect(mockUserContactUpdateService.verifyOtp).toBeCalledWith(mockRequest.session.user.userId, mockBody.inputOtp, mockBody.channel);
    });
  });
});
