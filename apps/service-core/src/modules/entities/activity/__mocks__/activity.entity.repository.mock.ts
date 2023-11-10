import { MockRepository } from '../../../../typings/common.mock';
import { ActivityEntityRepository } from '../activity.entity.repository';
import { createMockActivity } from './activity.mock';

export const mockActivityEntityRepository: MockRepository<ActivityEntityRepository> = {
  updateActivity: jest.fn(),
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockActivity(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
  }),
  insertActivityFiles: jest.fn(),

  findAndCountCompletedActivitiesByUserId: jest.fn(),
  findActivityUuidsByTransactionUuid: jest.fn(),
  findParentActivityByTransactionUuid: jest.fn(),
  findActivityWithParentByUuid: jest.fn(),
  findActivityWithFileAssetsByUuid: jest.fn(),
  findActivitiesWithUserAndFileAssetsParentByParentIdAndType: jest.fn(),
  findActivitiesByTypeAndTransactionUuid: jest.fn(),
  findActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndFileAssetUuidsAndTransactionUuid: jest.fn(),
  findActivityDetailsRequiredForEmail: jest.fn(),
  updateActivities: jest.fn(),
  findActivityByUuidAndStatusAndTypes: jest.fn(),
  findActivityAcknowledgeDetailsByUuidAndStatusAndTypes: jest.fn(),
  findActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers: jest.fn(),

  saveActivity: jest.fn(),
};
