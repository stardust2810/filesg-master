import { Test, TestingModule } from '@nestjs/testing';

import { mockNotificationMessageTemplateAuditEntityRepository } from '../__mocks__/notification-message-template-audit.entity.repository.mock';
import { mockNotificationMessageTemplateAuditModels } from '../__mocks__/notification-message-template-audit.entity.service.mock';
import { createMockNotificationMessageTemplateAudit } from '../__mocks__/notification-message-template-audit.mock';
import { NotificationMessageTemplateAuditEntityRepository } from '../notification-message-template-audit.entity.repository';
import { NotificationMessageTemplateAuditEntityService } from '../notification-message-template-audit.entity.service';

describe('NotificationMessageTemplateAuditEntityService', () => {
  let service: NotificationMessageTemplateAuditEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationMessageTemplateAuditEntityService,
        { provide: NotificationMessageTemplateAuditEntityRepository, useValue: mockNotificationMessageTemplateAuditEntityRepository },
      ],
    }).compile();

    service = module.get<NotificationMessageTemplateAuditEntityService>(NotificationMessageTemplateAuditEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildNotificationMessageTemplateAudit', () => {
    it(`should call getRepository's create function with right params`, () => {
      const notificationMessageTemplateAuditModel = mockNotificationMessageTemplateAuditModels[0];

      service.buildNotificationMessageTemplateAudit(notificationMessageTemplateAuditModel);

      expect(mockNotificationMessageTemplateAuditEntityRepository.getRepository().create).toBeCalledWith({
        ...notificationMessageTemplateAuditModel,
      });
    });
  });

  describe('insertNotificationMessageTemplateAudits', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedNotificationMessageTemplateAudits = mockNotificationMessageTemplateAuditModels.map((model) =>
        createMockNotificationMessageTemplateAudit({ ...model }),
      );

      const buildNotificationMessageTemplateAuditSpy = jest.spyOn(service, 'buildNotificationMessageTemplateAudit');

      await service.insertNotificationMessageTemplateAudits(mockNotificationMessageTemplateAuditModels);

      mockNotificationMessageTemplateAuditModels.forEach((model) => expect(buildNotificationMessageTemplateAuditSpy).toBeCalledWith(model));
      expect(mockNotificationMessageTemplateAuditEntityRepository.getRepository().insert).toBeCalledWith(
        expectedNotificationMessageTemplateAudits,
      );
    });
  });

  describe('saveNotificationMessageTemplateAudits', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedNotificationMessageTemplateAudits = mockNotificationMessageTemplateAuditModels.map((model) =>
        createMockNotificationMessageTemplateAudit({ ...model }),
      );

      const buildNotificationMessageTemplateAuditSpy = jest.spyOn(service, 'buildNotificationMessageTemplateAudit');

      await service.saveNotificationMessageTemplateAudits(mockNotificationMessageTemplateAuditModels);

      mockNotificationMessageTemplateAuditModels.forEach((model) => expect(buildNotificationMessageTemplateAuditSpy).toBeCalledWith(model));
      expect(mockNotificationMessageTemplateAuditEntityRepository.getRepository().save).toBeCalledWith(
        expectedNotificationMessageTemplateAudits,
      );
    });
  });

  describe('saveNotificationMessageTemplateAudit', () => {
    it(`should call saveNotificationMessageTemplateAudits function with a model in array`, async () => {
      const agencyModel = mockNotificationMessageTemplateAuditModels[0];
      const saveNotificationMessageTemplateAuditSpy = jest.spyOn(service, 'saveNotificationMessageTemplateAudits');

      await service.saveNotificationMessageTemplateAudit(agencyModel);

      expect(saveNotificationMessageTemplateAuditSpy).toBeCalledWith([agencyModel], undefined);
    });
  });
});
