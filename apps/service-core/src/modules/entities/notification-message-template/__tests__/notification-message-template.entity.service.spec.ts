import { Test, TestingModule } from '@nestjs/testing';

import { mockNotificationMessageTemplateEntityRepository } from '../__mocks__/notification-message-template.entity.repository.mock';
import { mockNotificationMessageTemplateModels } from '../__mocks__/notification-message-template.entity.service.mock';
import {
  mockNotificationMessageTemplateUuid,
  mockNotificationMessageTemplateUuid2,
} from '../__mocks__/notification-message-template.entity.service.mock';
import { createMockNotificationMessageTemplate } from '../__mocks__/notification-message-template.mock';
import { NotificationMessageTemplateEntityRepository } from '../notification-message-template.entity.repository';
import { NotificationMessageTemplateEntityService } from '../notification-message-template.entity.service';

const helpers = require('../../../../utils/helpers');

describe('NotificationMessageTemplateEntityService', () => {
  let service: NotificationMessageTemplateEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationMessageTemplateEntityService,
        { provide: NotificationMessageTemplateEntityRepository, useValue: mockNotificationMessageTemplateEntityRepository },
      ],
    }).compile();

    service = module.get<NotificationMessageTemplateEntityService>(NotificationMessageTemplateEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildNotificationMessageTemplate', () => {
    it(`should call getRepository's create function with right params`, () => {
      const notificationMessageTemplateModel = mockNotificationMessageTemplateModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageTemplateUuid);

      service.buildNotificationMessageTemplate(notificationMessageTemplateModel);

      expect(mockNotificationMessageTemplateEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockNotificationMessageTemplateUuid,
        ...notificationMessageTemplateModel,
      });
    });
  });

  describe('insertNotificationMessageTemplates', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedNotificationMessageTemplates = mockNotificationMessageTemplateModels.map((model, index) =>
        createMockNotificationMessageTemplate({ uuid: `mockNotificationMessageTemplate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageTemplateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageTemplateUuid2);
      const buildANotificationMessageTemplateSpy = jest.spyOn(service, 'buildNotificationMessageTemplate');

      await service.insertNotificationMessageTemplates(mockNotificationMessageTemplateModels);

      mockNotificationMessageTemplateModels.forEach((model) => expect(buildANotificationMessageTemplateSpy).toBeCalledWith(model));
      expect(mockNotificationMessageTemplateEntityRepository.getRepository().insert).toBeCalledWith(expectedNotificationMessageTemplates);
    });
  });

  describe('saveNotificationMessageTemplates', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedNotificationMessageTemplates = mockNotificationMessageTemplateModels.map((model, index) =>
        createMockNotificationMessageTemplate({ uuid: `mockNotificationMessageTemplate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageTemplateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockNotificationMessageTemplateUuid2);
      const buildNotificationMessageTemplateSpy = jest.spyOn(service, 'buildNotificationMessageTemplate');

      await service.saveNotificationMessageTemplates(mockNotificationMessageTemplateModels);

      mockNotificationMessageTemplateModels.forEach((model) => expect(buildNotificationMessageTemplateSpy).toBeCalledWith(model));
      expect(mockNotificationMessageTemplateEntityRepository.getRepository().save).toBeCalledWith(expectedNotificationMessageTemplates);
    });
  });

  describe('saveNotificationMessageTemplate', () => {
    it(`should call saveNotificationMessageTemplates function with a model in array`, async () => {
      const agencyModel = mockNotificationMessageTemplateModels[0];
      const saveNotificationMessageTemplateSpy = jest.spyOn(service, 'saveNotificationMessageTemplates');

      await service.saveNotificationMessageTemplate(agencyModel);

      expect(saveNotificationMessageTemplateSpy).toBeCalledWith([agencyModel], undefined);
    });
  });
});
