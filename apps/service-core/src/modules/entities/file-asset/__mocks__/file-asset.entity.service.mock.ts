import { ACTIVITY_STATUS, ACTIVITY_TYPE, FILE_STATUS, FILE_TYPE, STATUS } from '@filesg/common';

import { FileAssetCreationModel } from '../../../../entities/file-asset';
import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../activity/__mocks__/activity.mock';
import { createMockCitizenUser } from '../../user/__mocks__/user.mock';
import { FileAssetEntityService } from '../file-asset.entity.service';
import { createMockFileAsset } from './file-asset.mock';

export const mockFileAssetEntityService: MockService<FileAssetEntityService> = {
  // Create
  buildFileAsset: jest.fn(),
  insertFileAssets: jest.fn(),
  saveFileAssets: jest.fn(),
  saveFileAsset: jest.fn(),

  // Read
  retrieveFileAssetByUuid: jest.fn(),
  retrieveFileAssetsByUuids: jest.fn(),
  retrieveFileAssetByUuidAndUserUuid: jest.fn(),
  retrieveFileAssetByUuidAndUserId: jest.fn(),
  retrieveActivatedFileAssetByUuidAndUserId: jest.fn(),
  retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId: jest.fn(),
  retrieveDownloadableFileAssetsByUuidsAndUserUuid: jest.fn(),
  retrieveFileAssetsWithParentAndOaCertificateByUuids: jest.fn(),
  retrieveFileAssetsByStatusAndUserUuid: jest.fn(),
  retrieveAccessibleFileAssetByUuidAndUserId: jest.fn(),
  retrieveRecentFileAssets: jest.fn(),
  retrieveAllFileAssets: jest.fn(),
  retrieveFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid: jest.fn(),
  retrieveFileAssetsByStatusAndExpireAt: jest.fn(),
  retrieveAllChildrenUsingParentUuids: jest.fn(),
  retrieveFileAssetsByStatusesAndDeleteAt: jest.fn(),
  retrieveCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses: jest.fn(),
  retrieveCountAccessedAgencyIssuedFileAssets: jest.fn(),
  retrieveFileAssetsByUuidsWithAgencyInfo: jest.fn(),
  retrieveFileAssetByFileAssetUuidAndUserId: jest.fn(),
  retrieveAgencyFileAssetByRecipientFileAssetUuidAndEserviceUserUuid: jest.fn(),
  retrieveFileAssetsByStatusAndCorporateUen: jest.fn(),
  retrieveAllCorporateFileAssets: jest.fn(),

  // Update
  updateFileAsset: jest.fn(),
  updateFileAssets: jest.fn(),
  updateFileAssetStatus: jest.fn(),
  updateFileAssetFamilyByParentId: jest.fn(),
};

export const mockCitizenUser = createMockCitizenUser({
  id: 1,
  uin: 'S9203266C',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
});

export const mockFileAssetUuid = 'mockFileAsset-uuid-1';
export const mockFileAssetUuid2 = 'mockFileAsset-uuid-2';
export const mockFileAssetModels: FileAssetCreationModel[] = [
  { name: 'file.png', type: FILE_ASSET_TYPE.TRANSFERRED, status: FILE_STATUS.ACTIVE, documentType: FILE_TYPE.PNG, size: 1000 },
  { name: 'file2.pdf', type: FILE_ASSET_TYPE.TRANSFERRED, status: FILE_STATUS.ACTIVE, documentType: FILE_TYPE.PDF, size: 1000 },
];

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
  ownerId: 1,
});

export const mockFileAsset2 = createMockFileAsset({
  uuid: mockFileAssetUuid2,
  name: 'file2.pdf',
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.PDF,
  status: FILE_STATUS.ACTIVE,
  size: 123,
});

export const mockFileAssetWithActivity = createMockFileAsset({
  id: 1,
  uuid: mockFileAssetUuid,
  name: 'mockFile',
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.JPEG,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  metadata: {},
  oaCertificate: null,
  ownerId: 1,
  activities: [
    createMockActivity({
      type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
      status: ACTIVITY_STATUS.COMPLETED,
      isAcknowledgementRequired: true,
      acknowledgedAt: new Date('2023-01-01 08:00:00'),
    }),
  ],
});

export const mockFileAsset2WithActivity = createMockFileAsset({
  uuid: mockFileAssetUuid2,
  name: 'file2.pdf',
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.PDF,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  activities: [
    createMockActivity({
      type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
      status: ACTIVITY_STATUS.COMPLETED,
      isAcknowledgementRequired: true,
      acknowledgedAt: new Date('2023-01-01 08:00:00'),
    }),
  ],
});

export const mockFileAssetWithUnAcknowledgedActivity = createMockFileAsset({
  uuid: mockFileAssetUuid2,
  name: 'file2.pdf',
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.PDF,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  activities: [
    createMockActivity({
      type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
      status: ACTIVITY_STATUS.COMPLETED,
      isAcknowledgementRequired: true,
      acknowledgedAt: null,
    }),
  ],
});

export const mockFileAssets = [mockFileAsset, mockFileAsset2];
export const mockFileAssetsWithActivities = [mockFileAssetWithActivity, mockFileAsset2WithActivity];
export const mockFileAssetUuids = mockFileAssets.map((file) => file.uuid);

export const mockUploadFileAsset = mockFileAsset;
export const mockTransferredFileAsset = createMockFileAsset({
  id: 2,
  uuid: mockFileAssetUuid2,
  name: 'mockFile',
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.JPEG,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  metadata: {},
  oaCertificate: null,
  ownerId: 2,
});
