import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_ASSET_ACTION,
  FILE_STATUS,
  FILE_TYPE,
  OA_CERTIFICATE_STATUS,
  REVOCATION_TYPE,
  RevokeTransactionRequest,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { FileAssetHistoryCreationModel } from '../../../../entities/file-asset-history';
import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { ActivityFileInsert } from '../../../entities/activity/activity.entity.repository';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockOaCertificate } from '../../../entities/oa-certificate/__mocks__/oa-certificate.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockCitizenUser, createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';

// Requests
export const mockRevokeTransactionByTransactionUuidRequest: RevokeTransactionRequest = {
  transaction: {
    name: 'mockTransctionName',
    customAgencyMessage: { transaction: ['testTransactionMessage'], email: ['testEmailMessage'] },
  },
  revocation: {
    type: REVOCATION_TYPE.CANCELLED,
    reason: 'testMesage',
    transactionUuid: 'mockTransaction-uuid-1',
  },
};

export const mockRevokeTransactionByFileAssetUuidsRequest: RevokeTransactionRequest = {
  transaction: {
    name: 'mockTransctionName',
    customAgencyMessage: { transaction: ['testTransactionMessage'], email: ['testEmailMessage'] },
  },
  revocation: {
    type: REVOCATION_TYPE.CANCELLED,
    reason: 'testMesage',
    fileAssetUuids: ['mockFileAsset-uuid-1'],
  },
};

// Agency details
const mockAgency = createMockAgency({
  uuid: 'mockAgency-uuid-1',
  name: 'testAgency',
  code: 'TEST',
});

const mockEservice = createMockEservice({
  uuid: 'mockEservice-uuid-1',
  name: 'testEservice',
  emails: ['testEmail'],
  agency: mockAgency,
  users: [],
  agencyId: 0,
});

export const mockProgrammaticUser = createMockProgrammaticUser({
  uuid: 'mockProgrammaticUser-uuid-1',
  id: 1,
  clientId: 'test',
  clientSecret: 'test',
  status: STATUS.ACTIVE,
  eservices: [mockEservice],
});

mockEservice.users!.push(mockProgrammaticUser);

// Application
export const mockApplication = createMockApplication({});

// Issuance Transaction
export const mockCitizenUser = createMockCitizenUser({
  uin: 'mockUin',
  status: STATUS.ACTIVE,
});

export const mockIssuanceTransaction = createMockTransaction({
  uuid: 'mockTransaction-uuid-1',
  name: 'testTransactionName',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.COMPLETED,
  user: mockProgrammaticUser,
  userId: mockProgrammaticUser.id,
  application: mockApplication,
});

const mockFileAssetOaCertificate = createMockOaCertificate({
  id: 'mockOaCertificate-uuid-1',
  status: OA_CERTIFICATE_STATUS.ISSUED,
  hash: 'mockOaCertificate-hash-1',
});

export const mockEserviceFileAsset = createMockFileAsset({
  id: 1,
  uuid: 'mockFileAsset-uuid-1',
  name: 'mockFile',
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.OA,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  metadata: {},
  oaCertificate: mockFileAssetOaCertificate,
  oaCertificateId: mockFileAssetOaCertificate.id,
  ownerId: mockProgrammaticUser.id,
  issuerId: mockProgrammaticUser.id,
});

export const mockUserFileAsset = createMockFileAsset({
  id: 2,
  name: 'mockFile',
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.OA,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  metadata: {},
  oaCertificate: mockFileAssetOaCertificate,
  oaCertificateId: mockFileAssetOaCertificate.id,
});

export const mockReceiveTransferActivity = createMockActivity({
  id: 2,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  fileAssets: [mockUserFileAsset],
  recipientInfo: {
    name: 'mockUser',
    email: 'mockEmail',
    mobile: '12345678',
    dob: '1900-01-01',
  },
  user: mockCitizenUser,
});

// Revocation Transaction
export const mockRevocationTransaction = createMockTransaction({
  uuid: 'mockTransaction-uuid-2',
  name: 'mockTransactionName',
  type: TRANSACTION_TYPE.REVOKE,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.COMPLETED,
  user: mockProgrammaticUser,
  userId: mockProgrammaticUser.id,
  application: mockApplication,
});

export const mockSendRevokeActivity = createMockActivity({
  id: 3,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.SEND_REVOKE,
});

export const mockReceiveRevokeActivity = createMockActivity({
  id: 4,
  uuid: 'mockActivityUuid4',
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_REVOKE,
  recipientInfo: {
    name: 'mockUser',
    email: 'mockEmail',
    mobile: '12345678',
    dob: '1900-01-01',
  },
});

export const mockSendRevokeActivityFileInserts: ActivityFileInsert[] = [
  {
    activityId: mockSendRevokeActivity.id,
    fileAssetId: mockEserviceFileAsset.id,
  },
];

export const mockReceiveRevokeActivityFileInserts: ActivityFileInsert[] = [
  {
    activityId: mockReceiveRevokeActivity.id,
    fileAssetId: mockUserFileAsset.id,
  },
];

export const mockRevokeEserviceFileAssetHistories: FileAssetHistoryCreationModel[] = [mockEserviceFileAsset].map((fileAsset) => ({
  type: FILE_ASSET_ACTION.REVOKED,
  actionBy: mockProgrammaticUser,
  actionTo: mockProgrammaticUser,
  fileAsset,
}));

export const mockRevokeUserFileAssetHistories: FileAssetHistoryCreationModel[] = [mockUserFileAsset].map((fileAsset) => ({
  type: FILE_ASSET_ACTION.REVOKED,
  actionBy: mockProgrammaticUser,
  actionTo: mockCitizenUser,
  fileAsset,
}));
