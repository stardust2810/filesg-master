import { Test, TestingModule } from '@nestjs/testing';

import { mockApplicationTypeNotificationEntityRepository } from '../__mocks__/application-type-notification.entity.repository.mock';
import { mockApplicationTypeNotificationModels } from '../__mocks__/application-type-notification.entity.service.mock';
import { createMockApplicationTypeNotification } from '../__mocks__/application-type-notification.mock';
import { ApplicationTypeNotificationEntityRepository } from '../application-type-notification.entity.repository';
import { ApplicationTypeNotificationEntityService } from '../application-type-notification.entity.service';

describe('ApplicationTypeNotificationEntityService', () => {
  let service: ApplicationTypeNotificationEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTypeNotificationEntityService,
        { provide: ApplicationTypeNotificationEntityRepository, useValue: mockApplicationTypeNotificationEntityRepository },
      ],
    }).compile();

    service = module.get<ApplicationTypeNotificationEntityService>(ApplicationTypeNotificationEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildApplicationTypeNotification', () => {
    it(`should call getRepository's create function with right params`, () => {
      const applicationTypeNotificationModel = mockApplicationTypeNotificationModels[0];

      service.buildApplicationTypeNotification(applicationTypeNotificationModel);

      expect(mockApplicationTypeNotificationEntityRepository.getRepository().create).toBeCalledWith({
        ...applicationTypeNotificationModel,
      });
    });
  });

  describe('insertApplicationTypeNotifications', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedApplicationTypeNotifications = mockApplicationTypeNotificationModels.map((model) =>
        createMockApplicationTypeNotification({ ...model }),
      );

      const buildApplicationTypeNotificationSpy = jest.spyOn(service, 'buildApplicationTypeNotification');

      await service.insertApplicationTypeNotifications(mockApplicationTypeNotificationModels);

      mockApplicationTypeNotificationModels.forEach((model) => expect(buildApplicationTypeNotificationSpy).toBeCalledWith(model));
      expect(mockApplicationTypeNotificationEntityRepository.getRepository().insert).toBeCalledWith(expectedApplicationTypeNotifications);
    });
  });

  describe('saveApplicationTypeNotifications', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedApplicationTypeNotifications = mockApplicationTypeNotificationModels.map((model) =>
        createMockApplicationTypeNotification({ ...model }),
      );

      const buildApplicationTypeNotificationSpy = jest.spyOn(service, 'buildApplicationTypeNotification');

      await service.saveApplicationTypeNotifications(mockApplicationTypeNotificationModels);

      mockApplicationTypeNotificationModels.forEach((model) => expect(buildApplicationTypeNotificationSpy).toBeCalledWith(model));
      expect(mockApplicationTypeNotificationEntityRepository.getRepository().save).toBeCalledWith(expectedApplicationTypeNotifications);
    });
  });

  describe('saveApplicationTypeNotification', () => {
    it(`should call saveApplicationTypeNotifications function with a model in array`, async () => {
      const agencyModel = mockApplicationTypeNotificationModels[0];
      const saveApplicationTypeNotificationSpy = jest.spyOn(service, 'saveApplicationTypeNotifications');

      await service.saveApplicationTypeNotification(agencyModel);

      expect(saveApplicationTypeNotificationSpy).toBeCalledWith([agencyModel], undefined);
    });
  });
});
