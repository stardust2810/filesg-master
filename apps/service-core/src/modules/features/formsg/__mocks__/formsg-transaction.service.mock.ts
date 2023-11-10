import {
  CreateFormSgFileTransactionRequest,
  CreateTransactionV2Request,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  STATUS,
  TemplateMessageInput,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { createMockApplicationTypeNotification } from '../../../entities/application-type-notification/__mocks__/application-type-notification.mock';
import { createMockEserviceWhitelistedUser } from '../../../entities/eservice-whitelisted-user/__mocks__/eservice-whitelisted-user.mock';
import { createMockNotificationMessageTemplate } from '../../../entities/notification-message-template/__mocks__/notification-message-template.mock';
import { createMockTransactionCustomMessageTemplate } from '../../../entities/transaction-custom-message-template/__mocks__/transaction-custom-message-template.mock';
import { createMockCitizenUser, createMockEserviceUser } from '../../../entities/user/__mocks__/user.mock';
import { FormSgTransactionService } from '../formsg-transaction.service';

export class TestFormsgTransactionService extends FormSgTransactionService {
  public generateTemplateInput(customMessage: string[], paragraphCount?: number): TemplateMessageInput {
    return super.generateTemplateInput(customMessage, paragraphCount);
  }
}

export const mockFormSgTransactionService: MockService<FormSgTransactionService> = {
  createFormSgTransaction: jest.fn(),
  recallTransaction: jest.fn(),
};

// =============================================================================
// Mocks
// =============================================================================
export const mockEserviceWhitelistedUser = createMockEserviceWhitelistedUser({
  id: 1,
  email: 'test@test.email',
  status: STATUS.ACTIVE,
});

export const mockEserviceUser = createMockEserviceUser({
  id: 2,
  name: 'mockName',
  status: STATUS.ACTIVE,
  whitelistedUsers: [mockEserviceWhitelistedUser],
});

const mockCitizenUser = createMockCitizenUser({
  id: 2,
  name: 'mockName',
  uin: 'S3002610A',
  status: STATUS.ACTIVE,
});

export const mockCreateFormSgFileTransactionRequest: CreateFormSgFileTransactionRequest = {
  files: [
    {
      name: 'LTVP.oa',
      checksum: '11c0fbbdc104bc2d70448c8f3222887902c0b85bb3fbfe18af32d0cef4ad7b24',
      expiry: '2026-08-08',
      isPasswordEncryptionRequired: true,
      agencyPassword: { 'path/file.jpg': 'password' },
    },
  ],
  application: {
    type: 'LTVP',
    externalRefId: 'externalRef-uuid-1',
  },
  transaction: {
    name: 'LTVP application',
    isAcknowledgementRequired: true,
    longCustomMessage: ['a', 'b', 'c'],
    shortCustomMessage: ['a', 'b'],
    recipients: [
      {
        name: mockCitizenUser.name!,
        contact: '+6581234567',
        email: 'user1@gmail.com',
        uin: mockCitizenUser.uin,
        dob: '1995-01-01',
      },
    ],
  },
  requestorEmail: mockEserviceWhitelistedUser.email,
};

export const mockTransactionCustomMessageTemplate = createMockTransactionCustomMessageTemplate({
  name: 'mockTransactionTemplate',
  uuid: 'mockTransactionTemplate-uuid-1',

  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  template: ['a', 'b', 'c', '', ''],
});

export const mockEmailApplicationTypeNotification = createMockApplicationTypeNotification({
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockSgnotifyApplicationTypeNotification = createMockApplicationTypeNotification({
  notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
});

export const mockEmailNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mockEmailTemplate',
  uuid: 'mockEmailTemplate-uuid-1',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  template: ['a', 'b', 'c', '', ''],
  version: 1,
});

export const mockSgnotifyNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mockSgnotifyTemplate',
  uuid: 'mockSgnotifyTemplate-uuid-2',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  template: ['a', 'b', '', '', ''],
  version: 1,
});

export const mockCreateTransactionV2Request: CreateTransactionV2Request = {
  creationMethod: TRANSACTION_CREATION_METHOD.FORMSG,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  customAgencyMessage: {
    transaction: {
      templateId: mockTransactionCustomMessageTemplate.uuid,
      templateInput: {
        paragraph1: 'a',
        paragraph2: 'b',
        paragraph3: 'c',
        paragraph4: '',
        paragraph5: '',
      },
    },
    notifications: [
      {
        channel: NOTIFICATION_CHANNEL.EMAIL,
        templateId: mockEmailNotificationMessageTemplate.uuid,
        templateInput: {
          paragraph1: 'a',
          paragraph2: 'b',
          paragraph3: 'c',
          paragraph4: '',
          paragraph5: '',
        },
      },
      {
        channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
        templateId: mockSgnotifyNotificationMessageTemplate.uuid,
        templateInput: {
          paragraph1: 'a',
          paragraph2: 'b',
          paragraph3: '',
          paragraph4: '',
          paragraph5: '',
        },
      },
    ],
  },
  name: mockCreateFormSgFileTransactionRequest.transaction.name,
  recipients: mockCreateFormSgFileTransactionRequest.transaction.recipients,
  isAcknowledgementRequired: mockCreateFormSgFileTransactionRequest.transaction.isAcknowledgementRequired,
};

export const mockCreateFormSgFileTransactionRequestWithoutShortCustomMessage: CreateFormSgFileTransactionRequest = {
  files: [
    {
      name: 'LTVP.oa',
      checksum: '11c0fbbdc104bc2d70448c8f3222887902c0b85bb3fbfe18af32d0cef4ad7b24',
      expiry: '2026-08-08',
      isPasswordEncryptionRequired: true,
      agencyPassword: { 'path/file.jpg': 'password' },
    },
  ],
  application: {
    type: 'LTVP',
    externalRefId: 'externalRef-uuid-1',
  },
  transaction: {
    name: 'LTVP application',
    isAcknowledgementRequired: true,
    longCustomMessage: ['a', 'b', 'c'],
    recipients: [
      {
        name: mockCitizenUser.name!,
        contact: '+6581234567',
        email: 'user1@gmail.com',
        uin: mockCitizenUser.uin,
        dob: '1995-01-01',
      },
    ],
  },
  requestorEmail: mockEserviceWhitelistedUser.email,
};

export const mockCreateTransactionV2RequestWithoutShortCustomMessage: CreateTransactionV2Request = {
  creationMethod: TRANSACTION_CREATION_METHOD.FORMSG,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  customAgencyMessage: {
    transaction: {
      templateId: mockTransactionCustomMessageTemplate.uuid,
      templateInput: {
        paragraph1: 'a',
        paragraph2: 'b',
        paragraph3: 'c',
        paragraph4: '',
        paragraph5: '',
      },
    },
    notifications: [
      {
        channel: NOTIFICATION_CHANNEL.EMAIL,
        templateId: mockEmailNotificationMessageTemplate.uuid,
        templateInput: {
          paragraph1: 'a',
          paragraph2: 'b',
          paragraph3: 'c',
          paragraph4: '',
          paragraph5: '',
        },
      },
      {
        channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
        templateId: mockSgnotifyNotificationMessageTemplate.uuid,
        templateInput: {
          paragraph1: 'a',
          paragraph2: 'b',
          paragraph3: 'c',
          paragraph4: '',
          paragraph5: '',
        },
      },
    ],
  },
  name: mockCreateFormSgFileTransactionRequest.transaction.name,
  recipients: mockCreateFormSgFileTransactionRequest.transaction.recipients,
  isAcknowledgementRequired: mockCreateFormSgFileTransactionRequest.transaction.isAcknowledgementRequired,
};
