import { NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '@filesg/common';
import { NotificationRequestDetails } from '@filesg/sg-notify';
import { Test, TestingModule } from '@nestjs/testing';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { NotificationHistoryCreationModel } from '../../../../entities/notification-history';
import { SgNotifyIssuanceArgs } from '../../../../typings/common';
import { mockNotificationHistoryEntityService } from '../../../entities/notification-history/__mocks__/notification-history.entity.service.mock';
import { NotificationHistoryEntityService } from '../../../entities/notification-history/notification-history.entity.service';
import { mockEventLogsServiceClientProvider } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import {
  mockActivity,
  mockAgency,
  mockApplication,
  mockCitizenUser,
  mockNotificationMessageTemplate,
  mockSgNotifyLib,
  mockSgNotifyNotificationMessageInput,
  mockTransaction,
} from '../__mocks__/sg-notify.service.mock';
import { SG_NOTIFY_PROVIDER } from '../sg-notify.provider';
import { SgNotifyService } from '../sg-notify.service';

describe('SgNotifyService', () => {
  let service: SgNotifyService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SgNotifyService,
        {
          provide: SG_NOTIFY_PROVIDER,
          useValue: mockSgNotifyLib,
        },
        {
          provide: NotificationHistoryEntityService,
          useValue: mockNotificationHistoryEntityService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
        {
          provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER,
          useValue: mockEventLogsServiceClientProvider,
        },
      ],
    }).compile();

    service = module.get<SgNotifyService>(SgNotifyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should be defined', () => {
      expect(service.sendNotification).toBeDefined();
    });

    it('should call methods with correct args', async () => {
      const mockMessageId = 'mockMessageId';
      mockSgNotifyLib.sendNotification.mockResolvedValueOnce({
        request_id: mockMessageId,
      });

      await service.sendNotification(mockActivity, mockSgNotifyNotificationMessageInput);

      const mockIssuanceInput: SgNotifyIssuanceArgs = {
        recipientName: mockActivity.recipientInfo!.name,
        externalRefId: mockApplication.externalRefId!,
        activityUuid: mockActivity.uuid,
      };

      const mockNotificationRequestDetails: NotificationRequestDetails = {
        uin: mockCitizenUser.uin,
        channel_mode: 'SPM',
        delivery: 'IMMEDIATE',
        template_layout: [
          {
            template_id: mockNotificationMessageTemplate.externalTemplateId!,
            template_input: { ...mockIssuanceInput, ...mockSgNotifyNotificationMessageInput.templateInput! },
          },
        ],
        title: mockTransaction.name,
        sender_name: mockAgency.code,
        sender_logo_small: `${
          mockFileSGConfigService.systemConfig.fileSGBaseURL
        }/assets/images/icons/agency/${mockAgency.code.toLowerCase()}/emblem.png`,
        category: 'MESSAGES',
        priority: 'HIGH',
        cta: [
          {
            action_name: 'Open in FileSG',
            action_url: mockFileSGConfigService.notificationConfig.sgNotifyRetrievalPageUrl,
            action_type: 'HYPERLINK',
          },
        ],
      };

      const mockNotificationHistoryCreationModel: NotificationHistoryCreationModel = {
        notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
        activity: mockActivity,
        status: NOTIFICATION_STATUS.SUCCESS,
        statusDetails: `Sg-Notify send notification call successful`,
        messageId: mockMessageId,
      };

      expect(mockSgNotifyLib.sendNotification).toBeCalledWith(mockNotificationRequestDetails);
      expect(mockNotificationHistoryEntityService.insertNotificationHistories).toBeCalledWith([mockNotificationHistoryCreationModel]);
    });
  });
});
