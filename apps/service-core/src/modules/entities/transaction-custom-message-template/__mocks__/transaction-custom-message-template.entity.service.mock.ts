import { NOTIFICATION_TEMPLATE_TYPE } from '@filesg/common';

import { TransactionCustomMessageTemplateCreationModel } from '../../../../entities/transaction-custom-message-template';
import { MockService } from '../../../../typings/common.mock';
import { TransactionCustomMessageTemplateEntityService } from '../transaction-custom-message-template.entity.service';
import { createMockTransactionCustomMessageTemplate } from './transaction-custom-message-template.mock';

export const mockTransactionCustomMessageTemplateUuid = 'mockTransactionCustomMessageTemplate-uuid-1';
export const mockTransactionCustomMessageTemplateUuid2 = 'mockTransactionCustomMessageTemplate-uuid-2';

export const mockTransactionCustomMessageTemplateEntityService: MockService<TransactionCustomMessageTemplateEntityService> = {
  // Create
  buildTransactionCustomMessageTemplate: jest.fn(),
  insertTransactionCustomMessageTemplates: jest.fn(),
  saveTransactionCustomMessageTemplate: jest.fn(),
  saveTransactionCustomMessageTemplates: jest.fn(),
  // Read
  retrieveTransactionCustomMessageTemplate: jest.fn(),
  retrieveFormsgTransactionCustomMessageTemplatesByEserviceUserId: jest.fn(),
  // Update
  updateTransactionCustomMessageTemplate: jest.fn(),
};

export const mockTransactionCustomMessageTemplate = createMockTransactionCustomMessageTemplate({
  name: 'mock name 1',
  template: [],
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
});

export const mockTransactionCustomMessageTemplateModels: TransactionCustomMessageTemplateCreationModel[] = [
  {
    name: 'mock name 1',
    template: [],
    type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  },
  {
    name: 'mock name 2',
    template: [],
    type: NOTIFICATION_TEMPLATE_TYPE.CANCELLATION,
  },
];
