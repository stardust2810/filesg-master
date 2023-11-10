import { Test, TestingModule } from '@nestjs/testing';

import { mockNotificationHistoryEntityRepository } from '../__mocks__/notification-history.entity.repository.mock';
import { mockNotificationHistoryModels } from '../__mocks__/notification-history.entity.service.mock';
import { mockNotificationHistoryUuid, mockNotificationHistoryUuid2 } from '../__mocks__/notification-history.entity.service.mock';
import { createMockNotificationHistory } from '../__mocks__/notification-history.mock';
import { NotificationHistoryEntityRepository } from '../notification-history.entity.repository';
import { NotificationHistoryEntityService } from '../notification-history.entity.service';

const helpers = require('../../../../utils/helpers');

describe('NotificationHistoryEntityService', () => {
  let service: NotificationHistoryEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationHistoryEntityService,
        { provide: NotificationHistoryEntityRepository, useValue: mockNotificationHistoryEntityRepository },
      ],
    }).compile();

    service = module.get<NotificationHistoryEntityService>(NotificationHistoryEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildNotificationHistory', () => {
    it(`should call getRepository's create function with right params`, () => {
      const NotificationHistoryModel = mockNotificationHistoryModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationHistoryUuid);

      service.buildNotificationHistory(NotificationHistoryModel);

      expect(mockNotificationHistoryEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockNotificationHistoryUuid,
        ...NotificationHistoryModel,
      });
    });
  });

  describe('insertNotificationHistories', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedNotificationHistories = mockNotificationHistoryModels.map((model, index) =>
        createMockNotificationHistory({ uuid: `mockNotificationHistory-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationHistoryUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationHistoryUuid2);
      const buildANotificationHistorySpy = jest.spyOn(service, 'buildNotificationHistory');

      await service.insertNotificationHistories(mockNotificationHistoryModels);

      mockNotificationHistoryModels.forEach((model) => expect(buildANotificationHistorySpy).toBeCalledWith(model));
      expect(mockNotificationHistoryEntityRepository.getRepository().insert).toBeCalledWith(expectedNotificationHistories);
    });
  });

  describe('saveNotificationHistories', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedNotificationHistories = mockNotificationHistoryModels.map((model, index) =>
        createMockNotificationHistory({ uuid: `mockNotificationHistory-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationHistoryUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationHistoryUuid2);
      const buildNotificationHistorySpy = jest.spyOn(service, 'buildNotificationHistory');

      await service.saveNotificationHistories(mockNotificationHistoryModels);

      mockNotificationHistoryModels.forEach((model) => expect(buildNotificationHistorySpy).toBeCalledWith(model));
      expect(mockNotificationHistoryEntityRepository.getRepository().save).toBeCalledWith(expectedNotificationHistories);
    });
  });

  describe('saveNotificationHistory', () => {
    it(`should call saveNotificationHistories function with a model in array`, async () => {
      const agencyModel = mockNotificationHistoryModels[0];
      const saveNotificationHistorySpy = jest.spyOn(service, 'saveNotificationHistories');

      await service.saveNotificationHistory(agencyModel);

      expect(saveNotificationHistorySpy).toBeCalledWith([agencyModel], undefined);
    });
  });
});
