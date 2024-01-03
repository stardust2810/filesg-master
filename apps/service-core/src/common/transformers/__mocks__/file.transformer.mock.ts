import { ACTIVITY_STATUS, ACTIVITY_TYPE, FILE_ASSET_ACTION, FILE_STATUS, FILE_TYPE, STATUS } from '@filesg/common';

import { createMockActivity } from '../../../modules/entities/activity/__mocks__/activity.mock';
import { createMockAgency } from '../../../modules/entities/agency/__mocks__/agency.mock';
import { createMockEservice } from '../../../modules/entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../modules/entities/file-asset/__mocks__/file-asset.mock';
import { createMockFileAssetHistory } from '../../../modules/entities/file-asset-history/__mocks__/file-asset-history.mock';
import { createMockCitizenUser, createMockProgrammaticUser } from '../../../modules/entities/user/__mocks__/user.mock';
import { FILE_ASSET_TYPE } from '../../../typings/common';
const mockReceiveRevokeActivity = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_REVOKE,
  status: ACTIVITY_STATUS.COMPLETED,
});
export const mockReceiveTransferActivity = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  isAcknowledgementRequired: true,
  acknowledgedAt: null,
});
const mockUser = createMockCitizenUser({
  uin: 'S9203266C',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
});
export const mockAgency = createMockAgency({ name: 'Spotify', code: 'SPF', identityProofLocation: 'spotify.com' });

const mockEservice = createMockEservice({
  id: 1,
  name: 'ICA',
  emails: ['ica@gmail.com'],
  agency: mockAgency,
});
const mockIssuer = createMockProgrammaticUser({
  uuid: 'mockProgrammaticUserUuid',
  id: 1,
  isOnboarded: true,
  status: STATUS.ACTIVE,
  clientId: 'user-client-1',
  clientSecret: 'user-client-secret-1',
  eservices: [mockEservice],
});

const mockFileAssetViewedHistory = createMockFileAssetHistory({
  type: FILE_ASSET_ACTION.VIEWED,
  lastViewedAt: new Date(),
});

export const nonSingpassReceiveRevokeFileAsset = createMockFileAsset({
  type: FILE_ASSET_TYPE.TRANSFERRED,
  status: FILE_STATUS.REVOKED,
  name: 'mock-fileAsset-name',
  documentType: FILE_TYPE.OA,
  size: 100,
  activities: [mockReceiveRevokeActivity, mockReceiveTransferActivity],
  owner: {
    ...mockUser,
  },
  issuer: {
    ...mockIssuer,
  },
  histories: [mockFileAssetViewedHistory],
});
