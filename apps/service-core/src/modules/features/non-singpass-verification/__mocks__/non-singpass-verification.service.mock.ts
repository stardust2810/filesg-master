import { MockService } from '../../../../typings/common.mock';
import { NonSingpassVerificationService } from '../non-singpass-verification.service';

export const mockNonSingpassVerificationService: MockService<NonSingpassVerificationService> = {
  verify1Fa: jest.fn(),
  sendOtpFor2Fa: jest.fn(),
  verifyOtpFor2Fa: jest.fn(),
};

export const mockAccessToken = 'mockAccessToken';
