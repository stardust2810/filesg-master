import { Message } from '@aws-sdk/client-sqs';
import { EVENT, FILE_FAIL_CATEGORY, FILE_STATUS } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockSqsService } from '../../aws/__mocks__/sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import { mockDeleteEventService } from '../__mocks__/delete-event.service.mock';
import { mockDownloadEventService } from '../__mocks__/download-event.service.mock';
import { mockFormSgEventService } from '../__mocks__/formsg-event.service.mock';
import { mockMoveEventService } from '../__mocks__/move-event.service.mock';
import { mockPostScanEventService } from '../__mocks__/post-scan-event.service.mock';
import { TestCoreEventsQueueHandlerService } from '../__mocks__/update-queue-handler.service.mock';
import { mockUploadEventService } from '../__mocks__/upload-event.service.mock';
import { DeleteEventService } from '../events/delete-event.service';
import { DownloadEventService } from '../events/download-event.service';
import { FormSgEventService } from '../events/formsg-event.service';
import { MoveEventService } from '../events/move-event.service';
import { PostScanEventService } from '../events/post-scan-event.service';
import { UploadEventService } from '../events/upload-event.service';

const helpers = require('../../../../utils/helpers');

describe('UpdateQueueHandlerService', () => {
  let service: TestCoreEventsQueueHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestCoreEventsQueueHandlerService,
        { provide: SqsService, useValue: mockSqsService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: UploadEventService, useValue: mockUploadEventService },
        { provide: PostScanEventService, useValue: mockPostScanEventService },
        { provide: MoveEventService, useValue: mockMoveEventService },
        { provide: DownloadEventService, useValue: mockDownloadEventService },
        { provide: DeleteEventService, useValue: mockDeleteEventService },
        { provide: FormSgEventService, useValue: mockFormSgEventService },
      ],
    }).compile();

    service = module.get<TestCoreEventsQueueHandlerService>(TestCoreEventsQueueHandlerService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('pollHandler', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should sleep for 2 seconds when there is no message polled', async () => {
      mockSqsService.receiveMessageFromQueueCoreEvents.mockResolvedValueOnce([]);

      const sleepInSecsSpy = jest.spyOn(helpers, 'sleepInSecs');
      sleepInSecsSpy.mockReturnThis();

      const onMessageHandlerSpy = jest.spyOn(service, 'onMessageHandler');

      await service.pollHandler();

      expect(sleepInSecsSpy).toBeCalledWith(mockFileSGConfigService.systemConfig.pollingSleepTimeInSeconds);
      expect(onMessageHandlerSpy).toBeCalledTimes(0);
    });

    it('should process the messages when there are messages polled', async () => {
      const message: Message = {
        MessageId: 'message-1',
      };

      const message2: Message = {
        MessageId: 'message-2',
      };

      const mockMessages = [message, message2];
      mockSqsService.receiveMessageFromQueueCoreEvents.mockResolvedValueOnce(mockMessages);

      const onMessageHandlerSpy = jest.spyOn(service, 'onMessageHandler');
      onMessageHandlerSpy.mockReturnThis();

      const sleepInSecsSpy = jest.spyOn(helpers, 'sleepInSecs');

      await service.pollHandler();

      expect(onMessageHandlerSpy).toBeCalledTimes(2);
      mockMessages.forEach((message) => expect(onMessageHandlerSpy).toBeCalledWith(message));
      expect(sleepInSecsSpy).toBeCalledTimes(0);
    });
  });

  describe('onMessageHandler', () => {
    it('should call changeMessageVisiblityTimeoutInQueueCoreEvents when error occurs like message body is empty', async () => {
      const message: Message = {
        MessageId: 'message-1',
        Attributes: { ApproximateReceiveCount: '1' },
      };

      await service.onMessageHandler(message);

      expect(mockSqsService.changeMessageVisiblityTimeoutInQueueCoreEvents).toBeCalledWith(message, 0);
    });

    it('should call uploadToStgSuccessHandler when event is FILES_UPLOAD_TO_STG_COMPLETED', async () => {
      const bodyContent = { event: EVENT.FILES_UPLOAD_TO_STG_COMPLETED };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockUploadEventService.uploadToStgSuccessHandler).toBeCalledWith(bodyContent);
    });

    it('should call uploadtoStgFailedHandler when event is FILES_UPLOAD_TO_STG_FAILED', async () => {
      const bodyContent = { event: EVENT.FILES_UPLOAD_TO_STG_FAILED };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockUploadEventService.uploadtoStgFailedHandler).toBeCalledWith(bodyContent);
    });

    it('should call scanSuccessHandler when event is FILE_SCAN_SUCCESS', async () => {
      const bodyContent = { event: EVENT.FILE_SCAN_SUCCESS, payload: { fileAssetId: 'fileAsset-uuid-1' } };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockPostScanEventService.scanSuccessHandler).toBeCalledWith(bodyContent.payload.fileAssetId);
    });

    it('should call scanVirusOrErrorHandler when event is FILE_SCAN_VIRUS', async () => {
      const bodyContent = { event: EVENT.FILE_SCAN_VIRUS, payload: { fileAssetId: 'fileAsset-uuid-1', error: 'some error' } };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockPostScanEventService.scanVirusOrErrorHandler).toBeCalledWith(
        bodyContent.payload.fileAssetId,
        FILE_STATUS.FAILED,
        FILE_FAIL_CATEGORY.VIRUS,
        bodyContent.payload.error,
      );
    });

    it('should call scanVirusOrErrorHandler when event is FILE_SCAN_ERROR', async () => {
      const bodyContent = { event: EVENT.FILE_SCAN_ERROR, payload: { fileAssetId: 'fileAsset-uuid-1', error: 'some error' } };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockPostScanEventService.scanVirusOrErrorHandler).toBeCalledWith(
        bodyContent.payload.fileAssetId,
        FILE_STATUS.FAILED,
        FILE_FAIL_CATEGORY.SCAN_ERROR,
        bodyContent.payload.error,
      );
    });

    it('should call uploadMoveSuccessHandler when event is FILES_UPLOAD_MOVE_COMPLETED', async () => {
      const bodyContent = { event: EVENT.FILES_UPLOAD_MOVE_COMPLETED };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockMoveEventService.uploadMoveSuccessHandler).toBeCalledWith(bodyContent);
    });

    it('should call uploadMoveFailedHandler when event is FILES_UPLOAD_MOVE_FAILED', async () => {
      const bodyContent = { event: EVENT.FILES_UPLOAD_MOVE_FAILED };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockMoveEventService.uploadMoveFailedHandler).toBeCalledWith(bodyContent);
    });

    it('should call transferMoveSuccessHandler when event is FILES_TRANSFER_MOVE_COMPLETED', async () => {
      const bodyContent = { event: EVENT.FILES_TRANSFER_MOVE_COMPLETED };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockMoveEventService.transferMoveSuccessHandler).toBeCalledWith(bodyContent);
    });

    it('should call transferMoveFailedHandler when event is FILES_TRANSFER_MOVE_FAILED', async () => {
      const bodyContent = { event: EVENT.FILES_TRANSFER_MOVE_FAILED };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockMoveEventService.transferMoveFailedHandler).toBeCalledWith(bodyContent);
    });

    it('should call fileDownloadedHandler when event is FILES_DOWNLOADED', async () => {
      const bodyContent = { event: EVENT.FILES_DOWNLOADED };

      const message: Message = {
        MessageId: 'message-1',
        Body: JSON.stringify(bodyContent),
      };

      await service.onMessageHandler(message);

      expect(mockDownloadEventService.fileDownloadedHandler).toBeCalledWith(bodyContent);
    });
  });
});
