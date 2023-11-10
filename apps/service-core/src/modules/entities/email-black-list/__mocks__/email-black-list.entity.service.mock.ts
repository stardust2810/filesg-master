import { MockService } from '../../../../typings/common.mock';
import { EmailBlackListEntityService } from '../email-black-list.entity.service';
import { createMockBlackListedEmail } from './email-black-list.mock';

export const mockEmailBlackListEntityService: MockService<EmailBlackListEntityService> = {
  upsertByEmail: jest.fn(),
  retrieveBlackListedEmail: jest.fn(),
  deleteBlackListedEmail: jest.fn(),
};

export const mockBlackListedEmail = createMockBlackListedEmail({ emailAddress: 'blackListedEmail@gmail.com' });
