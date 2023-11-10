import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  AUTH_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  SSO_ESERVICE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { FILE_ASSET_TYPE, UserSessionAuditEventData } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockApplicationType } from '../../../entities/application-type/__mocks__/application-type.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockCitizenUser, createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { AuditEventService } from '../audit-event.service';

export const mockAuditEventService: MockService<AuditEventService> = {
  saveUserFilesAuditEvent: jest.fn(),
};

export const mockSessionId = 'mockSessionId-1';
export const mockFileAssetUuid = 'mockFileAsset-uuid-1';

export const mockCitizenUser = createMockCitizenUser({
  id: 2,
  uin: 'mockUin',
  status: STATUS.ACTIVE,
});

export const mockUserSessionAuditEventData: UserSessionAuditEventData = {
  sessionId: mockSessionId,
  authType: AUTH_TYPE.SINGPASS_SSO,
  userId: mockCitizenUser.id,
  ssoEservice: SSO_ESERVICE.MY_ICA,
  hasPerformedDocumentAction: false,
};

const mockApplicationType = createMockApplicationType({
  code: 'mockApplicationTypeCode',
  name: 'mockApplicationTypeName',
});

const mockApplication = createMockApplication({
  applicationType: mockApplicationType,
});

const mockTransaction = createMockTransaction({
  application: mockApplication,
  name: 'mockApplicationName',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

const mockActivities = [
  createMockActivity({ type: ACTIVITY_TYPE.RECEIVE_TRANSFER, status: ACTIVITY_STATUS.COMPLETED, transaction: mockTransaction }),
];

const mockAgency = createMockAgency({
  uuid: 'mockAgency-uuid-1',
  name: 'testAgency',
  code: 'TEST',
});

export const mockEservice = createMockEservice({
  uuid: 'mockEservice-uuid-1',
  name: 'testEservice',
  emails: ['testEmail'],
  agency: mockAgency,
  users: [],
  agencyId: 0,
});

export const mockEserviceUser = createMockProgrammaticUser({
  id: 1,
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
  clientId: 'testClientId',
  clientSecret: 'testClientSecret',
  eservices: [mockEservice],
});

export const mockFileAsset = createMockFileAsset({
  id: 1,
  uuid: mockFileAssetUuid,
  name: 'mockFile',
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.JPEG,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  metadata: {},
  oaCertificate: null,
  activities: mockActivities,
  issuer: mockEserviceUser,
});
