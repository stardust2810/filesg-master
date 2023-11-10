import { MockService } from '../../../../typings/common.mock';
import { EmailBlackListService } from '../email-black-list.service';

export const mockEmailBlackListService: MockService<EmailBlackListService> = {
  isEmailBlackListed: jest.fn(),
};

// =============================================================================
// Mock Constant
// =============================================================================
export const mockRecentBlackListedEmail = {
  emailAddress: 'bounce@simulator.amazonses.com',
  createdAt: new Date(),
};

export const mockOldBlackListedEmail = {
  emailAddress: 'bounce-old@simulator.amazonses.com',
  createdAt: new Date('01-01-2020'),
};
