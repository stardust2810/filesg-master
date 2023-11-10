import { EmailCreationModel } from '../../../../entities/email';
import { MockService } from '../../../../typings/common.mock';
import { EMAIL_TYPES } from '../../../../utils/email-template';
import { EmailEntityService } from '../../../entities/email/email.entity.service';
import { createMockEmail } from './email.mock';

const MOCK_BOUNCE_EMAIL = 'bounce@simulator.amazonses.com';

export const mockEmailEntityService: MockService<EmailEntityService> = {
  // Create
  buildEmail: jest.fn(),
  saveEmails: jest.fn(),
  saveEmail: jest.fn(),

  // Read
  retriveEmailByAwsMessageId: jest.fn(),
  retrieveEmailWithTransactionInfoByAwsMessageId: jest.fn(),

  // Update
  updateEmailTransactionalStatus: jest.fn(),
};

export const mockEmailUuid = 'mockEmail-uuid-1';
export const mockEmailUuid2 = 'mockEmail-uuid-2';

export const mockEmail = createMockEmail({
  id: 1,
  awsMessageId: 'aws-message-id-1',
  type: EMAIL_TYPES.ISSUANCE,
  emailId: MOCK_BOUNCE_EMAIL,
});

export const mockEmailModels: EmailCreationModel[] = [
  {
    awsMessageId: 'aws-message-id-1',
    type: EMAIL_TYPES.ISSUANCE,
    emailId: MOCK_BOUNCE_EMAIL,
  },
  {
    awsMessageId: 'aws-message-id-2',
    type: EMAIL_TYPES.ISSUANCE,
    emailId: MOCK_BOUNCE_EMAIL,
  },
];
