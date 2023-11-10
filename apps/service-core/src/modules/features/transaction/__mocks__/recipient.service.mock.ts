import { MockService } from '../../../../typings/common.mock';
import { RecipientService } from '../recipient.service';

export const mockRecipientService: MockService<RecipientService> = {
  updateUserEmailForTransactionId: jest.fn(),
};
