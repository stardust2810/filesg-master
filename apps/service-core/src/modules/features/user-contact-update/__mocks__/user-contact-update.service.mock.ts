import { STATUS } from '@filesg/common';

import { ContactVerificationOtpDetails } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { UserContactUpdateService } from '../user-contact-update.service';

export const mockUserContactUpdateService: MockService<UserContactUpdateService> = {
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
};

export const mockCitizenUser = createMockCitizenUser({
  id: 1,
  uuid: 'mockCitizenUser-uuid-1',
  uin: 'S1111111',
  email: 'mock@gmail.com',
  phoneNumber: '+6581234567',
  status: STATUS.ACTIVE,
});

export const mockContactToBeUpdated = 'new-mock-email@gmail.com';

export const mockRedisOtpDetails: ContactVerificationOtpDetails = {
  otp: '123456',
  verificationAttemptCount: 0,
  otpSentCount: 0,
  allowResendAt: new Date(),
  expireAt: new Date(),
  contact: mockContactToBeUpdated,
};
