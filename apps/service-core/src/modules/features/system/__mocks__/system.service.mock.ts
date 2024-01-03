import { ACTIVITY_STATUS, ACTIVITY_TYPE, FILE_STATUS, FILE_TYPE } from '@filesg/common';

import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { SystemService } from '../system.service';

export const mockSystemService: MockService<SystemService> = {
  resendNotification: jest.fn(),
  lift1FaBan: jest.fn(),
  lift2FaBan: jest.fn(),
  issuanceQuery: jest.fn(),
};

export class TestSystemService extends SystemService {
  public async lift1FaBan(activityUuid: string): Promise<void> {
    return super.lift1FaBan(activityUuid);
  }

  public async lift2FaBan(activityUuid: string): Promise<void> {
    return super.lift2FaBan(activityUuid);
  }
}

export const mockFileAsset = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-1',
  name: 'mockFile1',
  documentType: FILE_TYPE.JPEG,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  size: 123,
  status: FILE_STATUS.ACTIVE,
  metadata: {},
  oaCertificate: null,
});

export const mockRecipientInfo = {
  name: 'The Rock',
  dob: '1995-08-18',
  mobile: '+6581235678',
  email: 'rockMePls@gmail.com',
  failedAttempts: 0,
};

export const bannedFrom2FaActivity = createMockActivity({
  uuid: 'mock-uuid-1',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  fileAssets: [mockFileAsset],
  recipientInfo: { ...mockRecipientInfo },
  isBannedFromNonSingpassVerification: true,
});

export const bannedFrom1FaActivity = createMockActivity({
  uuid: 'mock-uuid-1',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  fileAssets: [mockFileAsset],
  recipientInfo: {
    ...mockRecipientInfo,
    failedAttempts: mockFileSGConfigService.nonSingpassAuthConfig.max1FaVerificationAttemptCount,
  },
  isBannedFromNonSingpassVerification: true,
});

export const activityWithoutBan = createMockActivity({
  uuid: 'mock-uuid-1',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  fileAssets: [mockFileAsset],
  recipientInfo: {
    ...mockRecipientInfo,
  },
  isBannedFromNonSingpassVerification: false,
});
