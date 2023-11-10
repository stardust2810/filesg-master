import { Test, TestingModule } from '@nestjs/testing';

import { mockNotificationMessageInputEntityRepository } from '../__mocks__/notification-message-input.entity.repository.mock';
import {
  mockNotificationMessageInputUuid,
  mockNotificationMessageInputUuid2,
} from '../__mocks__/notification-message-input.entity.service.mock';
import { mockNotificationMessageInputModels } from '../__mocks__/notification-message-input.entity.service.mock';
import { createMockNotificationMessageInput } from '../__mocks__/notification-message-input.mock';
import { NotificationMessageInputEntityRepository } from '../notification-message-input.entity.repository';
import { NotificationMessageInputEntityService } from '../notification-message-input.entity.service';

const helpers = require('../../../../utils/helpers');

describe('NotificationMessageInputEntityService', () => {
  let service: NotificationMessageInputEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationMessageInputEntityService,
        { provide: NotificationMessageInputEntityRepository, useValue: mockNotificationMessageInputEntityRepository },
      ],
    }).compile();

    service = module.get<NotificationMessageInputEntityService>(NotificationMessageInputEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildNotificationMessageInput', () => {
    it(`should call getRepository's create function with right params`, () => {
      const notificationMessageInputModel = mockNotificationMessageInputModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageInputUuid);

      service.buildNotificationMessageInput(notificationMessageInputModel);

      expect(mockNotificationMessageInputEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockNotificationMessageInputUuid,
        ...notificationMessageInputModel,
      });
    });
  });

  describe('insertNotificationMessageInputs', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedNotificationMessageInputs = mockNotificationMessageInputModels.map((model, index) =>
        createMockNotificationMessageInput({ uuid: `mockNotificationMessageInput-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageInputUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageInputUuid2);
      const buildANotificationMessageInputSpy = jest.spyOn(service, 'buildNotificationMessageInput');

      await service.insertNotificationMessageInputs(mockNotificationMessageInputModels);

      mockNotificationMessageInputModels.forEach((model) => expect(buildANotificationMessageInputSpy).toBeCalledWith(model));
      expect(mockNotificationMessageInputEntityRepository.getRepository().insert).toBeCalledWith(expectedNotificationMessageInputs);
    });
  });

  describe('saveNotificationMessageInputs', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedNotificationMessageInputs = mockNotificationMessageInputModels.map((model, index) =>
        createMockNotificationMessageInput({ uuid: `mockNotificationMessageInput-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageInputUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageInputUuid2);
      const buildNotificationMessageInputSpy = jest.spyOn(service, 'buildNotificationMessageInput');

      await service.saveNotificationMessageInputs(mockNotificationMessageInputModels);

      mockNotificationMessageInputModels.forEach((model) => expect(buildNotificationMessageInputSpy).toBeCalledWith(model));
      expect(mockNotificationMessageInputEntityRepository.getRepository().save).toBeCalledWith(expectedNotificationMessageInputs);
    });
  });

  describe('saveNotificationMessageInput', () => {
    it(`should call saveNotificationMessageInputs function with a model in array`, async () => {
      const agencyModel = mockNotificationMessageInputModels[0];
      const saveNotificationMessageInputSpy = jest.spyOn(service, 'saveNotificationMessageInputs');

      await service.saveNotificationMessageInput(agencyModel);

      expect(saveNotificationMessageInputSpy).toBeCalledWith([agencyModel], undefined);
    });
  });
});
