import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { SgNotify } from '@filesg/sg-notify';

import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockNotificationMessageInput } from '../../../entities/notification-message-input/__mocks__/notification-message-input.mock';
import { createMockNotificationMessageTemplate } from '../../../entities/notification-message-template/__mocks__/notification-message-template.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { SgNotifyService } from '../sg-notify.service';

export const mockSgNotifyService: MockService<SgNotifyService> = {
  sendNotification: jest.fn(),
};

export const mockSgNotifyLib: MockService<SgNotify> = {
  sendBatchNotification: jest.fn(),
  sendNotification: jest.fn(),
  SgNotifyAxiosClient: jest.fn(),
  getNotificationStatus: jest.fn(),
  getMultipleNotificationStatus: jest.fn(),
};

export const mockAgency = createMockAgency({
  name: 'mockName',
  code: 'mockCode',
});

const mockEservice = createMockEservice({
  agency: mockAgency,
  name: 'mockName',
  emails: ['mockEmail'],
});

export const mockApplication = createMockApplication({
  eservice: mockEservice,
  externalRefId: 'mockExtRefId',
});

export const mockTransaction = createMockTransaction({
  name: 'mockTransaction',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  application: mockApplication,
});

export const mockNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mockTemplateName',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  template: ['Mock template'],
  externalTemplateId: 'mockExtTemplateId',
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockSgNotifyNotificationMessageInput = createMockNotificationMessageInput({
  notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  notificationMessageTemplate: mockNotificationMessageTemplate,
  transaction: mockTransaction,
  templateInput: {
    mock: 'templateInput',
  },
  templateVersion: 1,
});

export const mockCitizenUser = createMockCitizenUser({
  uin: 'mockUin',
  status: STATUS.ACTIVE,
});

export const mockActivity = createMockActivity({
  id: 1,
  uuid: 'mockUuid',
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  transaction: mockTransaction,
  recipientInfo: {
    name: 'mockName',
  },
  user: mockCitizenUser,
});
