import { MockService } from '../../../../typings/common.mock';
import { OtpService } from '../otp.service';

export const mockOtpService: MockService<OtpService> = {
  generateOtp: jest.fn(),
  verifyOtp: jest.fn(),
  deleteOtpRecord: jest.fn(),
  getOtpRecord: jest.fn(),
};
