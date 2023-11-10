import { NOTIFICATION_TEMPLATE_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockEmailService } from '../__mocks__/email.service.mock';
import {
  mockActivity,
  mockActivityWithLegacyTransaction,
  mockActivityWithoutNotificationMessageInputs,
  mockSgNotifyNotificationMessageInput,
} from '../__mocks__/notification.service.mock';
import { mockSgNotifyService } from '../__mocks__/sg-notify.service.mock';
import { EmailService } from '../email.service';
import { NotificationService } from '../notification.service';
import { SgNotifyService } from '../sg-notify.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: SgNotifyService,
          useValue: mockSgNotifyService,
        },
        {
          provide: ActivityEntityService,
          useValue: mockActivityEntityService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processNotifications', () => {
    it('should be defined', () => {
      expect(service.processNotifications).toBeDefined();
    });

    it('should call methods with correct args', async () => {
      mockActivityEntityService.retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers.mockResolvedValueOnce([
        mockActivity,
      ]);

      await service.processNotifications([mockActivity.id], { templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE });

      expect(mockActivityEntityService.retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers).toBeCalledWith([
        mockActivity.id,
      ]);
      expect(mockSgNotifyService.sendNotification).toBeCalledWith(mockActivity, mockSgNotifyNotificationMessageInput, {
        templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
      });
    });

    it('should return if transaction has no notificationMessageInput', async () => {
      mockActivityEntityService.retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers.mockResolvedValueOnce([
        mockActivityWithoutNotificationMessageInputs,
      ]);

      await service.processNotifications([mockActivityWithoutNotificationMessageInputs.id], {
        templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
      });

      expect(mockActivityEntityService.retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers).toBeCalledWith([
        mockActivityWithoutNotificationMessageInputs.id,
      ]);
      expect(mockSgNotifyService.sendNotification).toBeCalledTimes(0);
    });

    it('should call emailService with null notificationMessageInput if transaction contains customAgencyMessage', async () => {
      mockActivityEntityService.retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers.mockResolvedValueOnce([
        mockActivityWithLegacyTransaction,
      ]);

      await service.processNotifications([mockActivityWithLegacyTransaction.id], { templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE });

      expect(mockEmailService.sendNotification).toBeCalledWith(mockActivityWithLegacyTransaction, null, {
        templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
      });
    });
  });
});
