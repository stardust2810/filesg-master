import { ACTIVITY_STATUS, ACTIVITY_TYPE, STATUS, TRANSACTION_CREATION_METHOD, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@filesg/common';

import { ActivityCreationModel } from '../../../../entities/activity';
import { MockService } from '../../../../typings/common.mock';
import { mockFileAsset, mockTransferredFileAsset, mockUploadFileAsset } from '../../file-asset/__mocks__/file-asset.entity.service.mock';
import { createMockTransaction } from '../../transaction/__mocks__/transaction.mock';
import { createMockCitizenUser } from '../../user/__mocks__/user.mock';
import { ActivityEntityService } from '../activity.entity.service';
import { createMockActivity } from './activity.mock';

export const mockActivityEntityService: MockService<ActivityEntityService> = {
  // Create
  buildActivity: jest.fn(),
  insertActivities: jest.fn(),
  insertActivityFiles: jest.fn(),
  saveActivity: jest.fn(),
  saveActivities: jest.fn(),

  // Read
  retrieveActivityByUuid: jest.fn(),
  retrieveActivityWithUserByUuid: jest.fn(),
  retrieveActivityWithFileAssetsByUuid: jest.fn(),
  retrieveParentActivityByTransactionUuid: jest.fn(),
  retrieveActivityWithParentByUuid: jest.fn(),
  retrieveParentActivityByUuid: jest.fn(),
  retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType: jest.fn(),
  retrieveActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndTransactionUuid: jest.fn(),
  retrieveActivitiesDetailsRequiredForEmail: jest.fn(),
  retrieveCompletedActivitiesByUserId: jest.fn(),
  retrieveActivityByUuidAndStatusAndTypes: jest.fn(),
  retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes: jest.fn(),
  retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers: jest.fn(),

  // Update
  updateActivity: jest.fn(),
  updateActivityStatus: jest.fn(),
  updateActivityRecipientInfo: jest.fn(),
  updateActivities: jest.fn(),
  saveActivityAcknowledgedAt: jest.fn(),
};

export const mockUser = createMockCitizenUser({
  uin: 'S9203266C',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
});

export const mockTransaction = createMockTransaction({
  name: 'mockTransactionName',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.COMPLETED,
});

export const mockActivity = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
});

export const mockActivity2 = createMockActivity({
  uuid: 'mock-uuid-1',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  fileAssets: [mockFileAsset],
});

export const mockActivityUuid = 'mockActivity-uuid-1';
export const mockActivityUuid2 = 'mockActivity-uuid-2';
export const mockActivityModels: ActivityCreationModel[] = [
  {
    type: ACTIVITY_TYPE.SEND_TRANSFER,
    status: ACTIVITY_STATUS.COMPLETED,
  },
  {
    type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
    status: ACTIVITY_STATUS.COMPLETED,
  },
];

export const mockUploadActivty = createMockActivity({
  id: 1,
  uuid: 'mock-activity-01',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.COMPLETED,
  fileAssets: [mockUploadFileAsset],
});

export const mockSendTransferActivty = createMockActivity({
  id: 2,
  uuid: 'mock-activity-02',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  fileAssets: [mockUploadFileAsset],
});

export const mockReceiveTransferActivty = createMockActivity({
  id: 3,
  uuid: 'mock-activity-03',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  fileAssets: [mockTransferredFileAsset],
  recipientInfo: { name: 'Jason', mobile: '+6511111111' },
});
