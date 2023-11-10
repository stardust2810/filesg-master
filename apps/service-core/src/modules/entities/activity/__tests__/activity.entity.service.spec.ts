/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { ACTIVITY_STATUS, ACTIVITY_TYPE, COMPONENT_ERROR_CODE, FILE_STATUS, FILE_TYPE, SORT_BY } from '@filesg/common';
import { CompletedActivitiesRequestDto } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Activity, ActivityUpdateModel } from '../../../../entities/activity';
import { ActivityRecipientInfo, FILE_ASSET_TYPE } from '../../../../typings/common';
import { createMockFileAsset } from '../../file-asset/__mocks__/file-asset.mock';
import { mockActivityEntityRepository } from '../__mocks__/activity.entity.repository.mock';
import { mockActivity, mockActivityModels, mockActivityUuid, mockActivityUuid2 } from '../__mocks__/activity.entity.service.mock';
import { createMockActivity } from '../__mocks__/activity.mock';
import { ActivityEntityRepository, ActivityFileInsert } from '../activity.entity.repository';
import { ActivityEntityService } from '../activity.entity.service';

const helpers = require('../../../../utils/helpers');

describe('ActivityEntityService', () => {
  let service: ActivityEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityEntityService, { provide: ActivityEntityRepository, useValue: mockActivityEntityRepository }],
    }).compile();

    service = module.get<ActivityEntityService>(ActivityEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildActivity', () => {
    it(`should call getRepository's create function with right params`, () => {
      const activityModel = mockActivityModels[0];

      jest.spyOn(helpers, 'generateActivityUUID').mockReturnValueOnce(mockActivityUuid);

      service.buildActivity(activityModel);

      expect(mockActivityEntityRepository.getRepository().create).toBeCalledWith({ uuid: mockActivityUuid, ...activityModel });
    });
  });

  describe('insertActivities', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedActivities = mockActivityModels.map((model, index) =>
        createMockActivity({ uuid: `mockActivity-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateActivityUUID').mockReturnValueOnce(mockActivityUuid);
      jest.spyOn(helpers, 'generateActivityUUID').mockReturnValueOnce(mockActivityUuid2);
      const buildActivitySpy = jest.spyOn(service, 'buildActivity');

      await service.insertActivities(mockActivityModels);

      mockActivityModels.forEach((model) => expect(buildActivitySpy).toBeCalledWith(model));
      expect(mockActivityEntityRepository.getRepository().insert).toBeCalledWith(expectedActivities);
    });
  });

  describe('saveActivities', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedActivities = mockActivityModels.map((model, index) =>
        createMockActivity({ uuid: `mockActivity-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateActivityUUID').mockReturnValueOnce(mockActivityUuid);
      jest.spyOn(helpers, 'generateActivityUUID').mockReturnValueOnce(mockActivityUuid2);
      const buildActivitySpy = jest.spyOn(service, 'buildActivity');

      await service.saveActivities(mockActivityModels);

      mockActivityModels.forEach((model) => expect(buildActivitySpy).toBeCalledWith(model));
      expect(mockActivityEntityRepository.getRepository().save).toBeCalledWith(expectedActivities);
    });
  });

  describe('saveActivity', () => {
    it(`should call saveActivities function with a model in array`, async () => {
      const activityModel = mockActivityModels[0];

      const saveActivitiesSpy = jest.spyOn(service, 'saveActivities');

      await service.saveActivity(activityModel);

      expect(saveActivitiesSpy).toBeCalledWith([activityModel], undefined);
    });
  });

  describe('insertActivityFiles', () => {
    it(`should call repository's insertActivityFiles function with right params`, async () => {
      const inserts: ActivityFileInsert[] = [{ activityId: 1, fileAssetId: 1 }];

      await service.insertActivityFiles(inserts);

      expect(mockActivityEntityRepository.insertActivityFiles).toBeCalledWith(inserts, undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveActivityByUuid', () => {
    it('should return activity when found', async () => {
      mockActivityEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockActivity);

      expect(await service.retrieveActivityByUuid(mockActivityUuid)).toEqual(mockActivity);
      expect(mockActivityEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockActivityUuid } });
    });

    it('should throw EntityNotFoundException when toThrow set to true and activity is not found', async () => {
      mockActivityEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveActivityByUuid(mockActivityUuid, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, 'uuid', `${mockActivityUuid}`),
      );
      expect(mockActivityEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockActivityUuid } });
    });

    it('should return null when toThrow set to false and activity is not found', async () => {
      mockActivityEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(await service.retrieveActivityByUuid(mockActivityUuid, { toThrow: false })).toEqual(null);
      expect(mockActivityEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockActivityUuid } });
    });
  });

  describe('retrieveActivityWithUserByUuid', () => {
    it('should return activity when found', async () => {
      mockActivityEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockActivity);

      expect(await service.retrieveActivityWithUserByUuid(mockActivityUuid)).toEqual(mockActivity);
      expect(mockActivityEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uuid: mockActivityUuid },
        relations: ['user'],
      });
    });

    it('should throw EntityNotFoundException when toThrow set to true and activity is not found', async () => {
      mockActivityEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveActivityWithUserByUuid(mockActivityUuid, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, 'uuid', `${mockActivityUuid}`),
      );
      expect(mockActivityEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uuid: mockActivityUuid },
        relations: ['user'],
      });
    });

    it('should return null when toThrow set to false and activity is not found', async () => {
      mockActivityEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(await service.retrieveActivityWithUserByUuid(mockActivityUuid, { toThrow: false })).toEqual(null);
      expect(mockActivityEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uuid: mockActivityUuid },
        relations: ['user'],
      });
    });
  });

  describe('retrieveParentActivityByTransactionUuid', () => {
    it('should return activity when found', async () => {
      mockActivityEntityRepository.findParentActivityByTransactionUuid.mockResolvedValueOnce(mockActivity);

      expect(await service.retrieveParentActivityByTransactionUuid(mockActivityUuid)).toEqual(mockActivity);
      expect(mockActivityEntityRepository.findParentActivityByTransactionUuid).toBeCalledWith(mockActivityUuid, undefined);
    });

    it('should throw EntityNotFoundException when activity is not found', async () => {
      mockActivityEntityRepository.findParentActivityByTransactionUuid.mockResolvedValueOnce(null);

      await expect(service.retrieveParentActivityByTransactionUuid(mockActivityUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, `transaction parent ${Activity.name}`, 'uuid', mockActivityUuid),
      );
      expect(mockActivityEntityRepository.findParentActivityByTransactionUuid).toBeCalledWith(mockActivityUuid, undefined);
    });
  });

  describe('retrieveActivityWithParentByUuid', () => {
    it('should return activity when found', async () => {
      mockActivityEntityRepository.findActivityWithParentByUuid.mockResolvedValueOnce(mockActivity);

      expect(await service.retrieveActivityWithParentByUuid(mockActivityUuid)).toEqual(mockActivity);
      expect(mockActivityEntityRepository.findActivityWithParentByUuid).toBeCalledWith(mockActivityUuid, undefined);
    });

    it('should throw EntityNotFoundException when activity is not found', async () => {
      mockActivityEntityRepository.findActivityWithParentByUuid.mockResolvedValueOnce(null);

      await expect(service.retrieveActivityWithParentByUuid(mockActivityUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, `${Activity.name}`, 'uuid', mockActivityUuid),
      );
      expect(mockActivityEntityRepository.findActivityWithParentByUuid).toBeCalledWith(mockActivityUuid, undefined);
    });
  });

  describe('retrieveParentActivityByUuid', () => {
    it('should return parent activity when activity found with parent activity', async () => {
      const parentActivity = createMockActivity({
        type: ACTIVITY_TYPE.SEND_TRANSFER,
        status: ACTIVITY_STATUS.COMPLETED,
      });

      const mockActivityWithParent = createMockActivity({
        type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
        status: ACTIVITY_STATUS.COMPLETED,
        parent: parentActivity,
      });

      const retrieveActivityWithParentByUuidSpy = jest.spyOn(service, 'retrieveActivityWithParentByUuid');
      retrieveActivityWithParentByUuidSpy.mockResolvedValueOnce(mockActivityWithParent);

      expect(await service.retrieveParentActivityByUuid(mockActivityUuid)).toEqual(parentActivity);
      expect(retrieveActivityWithParentByUuidSpy).toBeCalledWith(mockActivityUuid, undefined);
    });

    it(`should throw EntityNotFoundException when activity's parent is not found`, async () => {
      mockActivityEntityRepository.findActivityWithParentByUuid.mockResolvedValueOnce(mockActivity);

      await expect(service.retrieveParentActivityByUuid(mockActivityUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, 'parent', `${Activity.name} with uuid`, mockActivityUuid),
      );
      expect(mockActivityEntityRepository.findActivityWithParentByUuid).toBeCalledWith(mockActivityUuid, undefined);
    });
  });

  describe('retrieveActivityByUuidAndStatusAndTypes', () => {
    it('should return activity when found', async () => {
      mockActivityEntityRepository.findActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(mockActivity);

      expect(
        await service.retrieveActivityByUuidAndStatusAndTypes(mockActivityUuid, ACTIVITY_STATUS.COMPLETED, [
          ACTIVITY_TYPE.RECEIVE_TRANSFER,
        ]),
      ).toEqual(mockActivity);

      expect(mockActivityEntityRepository.findActivityByUuidAndStatusAndTypes).toBeCalledWith(
        mockActivityUuid,
        ACTIVITY_STATUS.COMPLETED,
        [ACTIVITY_TYPE.RECEIVE_TRANSFER],
        undefined,
        undefined,
      );
    });

    it('should throw EntityNotFoundException when activity is not found', async () => {
      mockActivityEntityRepository.findActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(null);

      await expect(
        service.retrieveActivityByUuidAndStatusAndTypes(mockActivityUuid, ACTIVITY_STATUS.COMPLETED, [ACTIVITY_TYPE.RECEIVE_TRANSFER]),
      ).rejects.toThrowError(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.ACTIVITY_SERVICE,
          Activity.name,
          'uuid, status, and types',
          `${mockActivityUuid}, ${ACTIVITY_STATUS.COMPLETED} and ${ACTIVITY_TYPE.RECEIVE_TRANSFER}`,
        ),
      );

      expect(mockActivityEntityRepository.findActivityByUuidAndStatusAndTypes).toBeCalledWith(
        mockActivityUuid,
        ACTIVITY_STATUS.COMPLETED,
        [ACTIVITY_TYPE.RECEIVE_TRANSFER],
        undefined,
        undefined,
      );
    });
  });

  describe('retrieveActivityWithFileAssetsByUuid', () => {
    const mockFileAsset = createMockFileAsset({
      type: FILE_ASSET_TYPE.TRANSFERRED,
      status: FILE_STATUS.ACTIVE,
      name: 'mock-fileAsset-name',
      documentType: FILE_TYPE.PDF,
      size: 1000,
    });

    const mockActivityWithFileAsset = createMockActivity({
      type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
      status: ACTIVITY_STATUS.COMPLETED,
      fileAssets: [mockFileAsset],
    });

    it('should return activity when found', async () => {
      mockActivityEntityRepository.findActivityWithFileAssetsByUuid.mockResolvedValueOnce(mockActivityWithFileAsset);

      expect(await service.retrieveActivityWithFileAssetsByUuid(mockActivityUuid)).toEqual(mockActivityWithFileAsset);
      expect(mockActivityEntityRepository.findActivityWithFileAssetsByUuid).toBeCalledWith(mockActivityUuid, undefined);
    });

    it(`should throw EntityNotFoundException when activity is not found`, async () => {
      mockActivityEntityRepository.findActivityWithFileAssetsByUuid.mockResolvedValueOnce(null);

      await expect(service.retrieveActivityWithFileAssetsByUuid(mockActivityUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, `${Activity.name} with file assets`, 'uuid', mockActivityUuid),
      );
      expect(mockActivityEntityRepository.findActivityWithFileAssetsByUuid).toBeCalledWith(mockActivityUuid, undefined);
    });

    it(`should throw EntityNotFoundException when activity's fileAssets is not found or of length 0`, async () => {
      mockActivityWithFileAsset.fileAssets = [];
      mockActivityEntityRepository.findActivityWithFileAssetsByUuid.mockResolvedValueOnce(mockActivityWithFileAsset);

      await expect(service.retrieveActivityWithFileAssetsByUuid(mockActivityUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, 'uuid', mockActivityUuid),
      );
      expect(mockActivityEntityRepository.findActivityWithFileAssetsByUuid).toBeCalledWith(mockActivityUuid, undefined);
    });
  });

  describe('retrieveCompletedActivitiesByUserId', () => {
    const query: CompletedActivitiesRequestDto = {
      sortBy: SORT_BY.LAST_VIEWED_AT,
      asc: true,
      types: [ACTIVITY_TYPE.RECEIVE_TRANSFER],
    };

    it('should return next with null value when queryAll (page and limit is both 0 or NOT given)', async () => {
      const mockUserId = 1;
      const mockActivities = [mockActivity];
      mockActivityEntityRepository.findAndCountCompletedActivitiesByUserId.mockResolvedValueOnce([mockActivities, 1]);

      expect(await service.retrieveCompletedActivitiesByUserId(mockUserId, query)).toEqual({
        activities: mockActivities,
        count: 1,
        next: null,
      });
      expect(mockActivityEntityRepository.findAndCountCompletedActivitiesByUserId).toBeCalledWith(mockUserId, query, undefined);
    });

    it('should return next page number when there is still remaining items', async () => {
      const mockUserId = 1;
      const mockActivity2 = createMockActivity({
        type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
        status: ACTIVITY_STATUS.COMPLETED,
      });

      const mockActivities = [mockActivity, mockActivity2];
      mockActivityEntityRepository.findAndCountCompletedActivitiesByUserId.mockResolvedValueOnce([mockActivities, 2]);

      query.page = 1;
      query.limit = 1;

      expect(await service.retrieveCompletedActivitiesByUserId(mockUserId, query)).toEqual({
        activities: mockActivities,
        count: 2,
        next: 2,
      });
      expect(mockActivityEntityRepository.findAndCountCompletedActivitiesByUserId).toBeCalledWith(mockUserId, query, undefined);
    });
  });

  describe('retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType', () => {
    it('should return activities when found', async () => {
      const mockParentUuid = 'mock-uuid-1';

      mockActivityEntityRepository.findActivitiesWithUserAndFileAssetsParentByParentIdAndType.mockResolvedValueOnce([mockActivity]);

      expect(
        await service.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType(mockParentUuid, ACTIVITY_TYPE.RECEIVE_TRANSFER),
      ).toEqual([mockActivity]);

      expect(mockActivityEntityRepository.findActivitiesWithUserAndFileAssetsParentByParentIdAndType).toBeCalledWith(
        mockParentUuid,
        ACTIVITY_TYPE.RECEIVE_TRANSFER,
        undefined,
      );
    });
  });

  describe('retrieveActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndTransactionUuid', () => {
    it('should return activities if found', async () => {
      const activityType = ACTIVITY_TYPE.RECEIVE_TRANSFER;
      const fileAssetUuids = ['fileAsset-uuid-1'];
      const transactionUuid = 'transaction-uuid-1';
      const mockActivities = [mockActivity];

      mockActivityEntityRepository.findActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndFileAssetUuidsAndTransactionUuid.mockResolvedValueOnce(
        mockActivities,
      );

      expect(
        await service.retrieveActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndTransactionUuid(
          activityType,
          fileAssetUuids,
          transactionUuid,
        ),
      ).toEqual(mockActivities);

      expect(
        mockActivityEntityRepository.findActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndFileAssetUuidsAndTransactionUuid,
      ).toBeCalledWith(activityType, fileAssetUuids, transactionUuid, undefined);
    });

    it('should throw EntityNotFoundException when activities length is 0', async () => {
      const activityType = ACTIVITY_TYPE.RECEIVE_TRANSFER;
      const fileAssetUuids = ['fileAsset-uuid-1'];
      const transactionUuid = 'transaction-uuid-1';

      mockActivityEntityRepository.findActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndFileAssetUuidsAndTransactionUuid.mockResolvedValueOnce(
        [],
      );

      await expect(
        service.retrieveActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndTransactionUuid(
          activityType,
          fileAssetUuids,
          transactionUuid,
        ),
      ).rejects.toThrowError(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.ACTIVITY_SERVICE,
          Activity.name,
          `activityType: ${activityType} and transactionUuid: ${transactionUuid}`,
        ),
      );

      expect(
        mockActivityEntityRepository.findActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndFileAssetUuidsAndTransactionUuid,
      ).toBeCalledWith(activityType, fileAssetUuids, transactionUuid, undefined);
    });
  });

  describe('retrieveActivitiesDetailsRequiredForEmail', () => {
    it('should retrun activity when found', async () => {
      const activityUuids = ['activity-uuid-1'];
      const activityType = ACTIVITY_TYPE.RECEIVE_TRANSFER;
      const mockActivities = [mockActivity];

      mockActivityEntityRepository.findActivityDetailsRequiredForEmail.mockResolvedValueOnce(mockActivities);

      expect(await service.retrieveActivitiesDetailsRequiredForEmail(activityUuids, activityType)).toEqual(mockActivities);
      expect(mockActivityEntityRepository.findActivityDetailsRequiredForEmail).toBeCalledWith(activityUuids, activityType, undefined);
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('updateActivity', () => {
    it(`should call activity repository's updateActivity function with right params`, async () => {
      const activityUuid = 'activity-uuid-1';
      const dataToBeUpdated: ActivityUpdateModel = { type: ACTIVITY_TYPE.RECEIVE_TRANSFER };

      await service.updateActivity(activityUuid, dataToBeUpdated);

      expect(mockActivityEntityRepository.updateActivity).toBeCalledWith(activityUuid, dataToBeUpdated, undefined);
    });
  });

  describe('updateActivityStatus', () => {
    it(`should call activity repository's updateActivity function with right params`, async () => {
      const activityUuid = 'activity-uuid-1';
      const status = ACTIVITY_STATUS.COMPLETED;

      await service.updateActivityStatus(activityUuid, status);

      expect(mockActivityEntityRepository.updateActivity).toBeCalledWith(activityUuid, { status }, undefined);
    });
  });

  describe('updateActivityRecipientInfo', () => {
    it(`should call activity repository's updateActivity function with right params`, async () => {
      const activityUuid = 'activity-uuid-1';
      const recipientInfo: ActivityRecipientInfo = {
        name: 'some-name',
        dob: '01-01-1995',
      };

      await service.updateActivityRecipientInfo(activityUuid, recipientInfo);

      expect(mockActivityEntityRepository.updateActivity).toBeCalledWith(activityUuid, { recipientInfo }, undefined);
    });
  });

  describe('updateActivities', () => {
    it(`should call activity repository's updateActivities function with right params`, async () => {
      const activityUuids = ['activity-uuid-1', 'activity-uuid-2'];
      const dataToBeUpdated: ActivityUpdateModel = { type: ACTIVITY_TYPE.RECEIVE_TRANSFER };

      await service.updateActivities(activityUuids, dataToBeUpdated);

      expect(mockActivityEntityRepository.updateActivities).toBeCalledWith(activityUuids, dataToBeUpdated, undefined);
    });
  });
});
