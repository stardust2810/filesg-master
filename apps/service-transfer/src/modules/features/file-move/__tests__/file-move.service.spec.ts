import { Message } from '@aws-sdk/client-sqs';
import { Test, TestingModule } from '@nestjs/testing';

import { MGMT_SERVICE_API_CLIENT_PROVIDER } from '../../../../typings/common';
import { mockMgmtServiceApiClient } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockSqsService } from '../../aws/__mocks__/aws-sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import { mockDeleteService } from '../__mocks__/delete.service.mock';
import { TestFileMoveService } from '../__mocks__/file-move.service.mock';
import { mockUploadAndTransferMoveService } from '../__mocks__/upload-transfer-move.service.mock';
import { DeleteService } from '../move-type/delete.service';
import { UploadAndTransferMoveService } from '../move-type/upload-transfer-move.service';

const helpers = require('../../../../utils/common');

// gd TODO: update test
describe.skip('FileMoveService', () => {
  let service: TestFileMoveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFileMoveService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: SqsService, useValue: mockSqsService },
        { provide: UploadAndTransferMoveService, useValue: mockUploadAndTransferMoveService },
        { provide: DeleteService, useValue: mockDeleteService },
        { provide: MGMT_SERVICE_API_CLIENT_PROVIDER, useValue: mockMgmtServiceApiClient },
      ],
    }).compile();

    service = module.get<TestFileMoveService>(TestFileMoveService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pollHandler', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should sleep for 2 seconds when there is no message polled', async () => {
      mockSqsService.receiveMessageFromQueueTransferEvents.mockResolvedValueOnce([]);

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
      mockSqsService.receiveMessageFromQueueTransferEvents.mockResolvedValueOnce(mockMessages);

      const onMessageHandlerSpy = jest.spyOn(service, 'onMessageHandler');
      onMessageHandlerSpy.mockReturnThis();

      const sleepInSecsSpy = jest.spyOn(helpers, 'sleepInSecs');

      await service.pollHandler();

      expect(onMessageHandlerSpy).toBeCalledTimes(2);
      mockMessages.forEach((message) => expect(onMessageHandlerSpy).toBeCalledWith(message));
      expect(sleepInSecsSpy).toBeCalledTimes(0);
    });
  });

  // describe('onMessageHandler', () => {
  //   it.skip('should call changeMessageVisiblityTimeoutInQueueTransferEvents when error occurs like message body is empty', async () => {
  //     const message: Message = {
  //       MessageId: 'message-1',
  //       Attributes: { ApproximateReceiveCount: '1' },
  //     };

  //     await service.onMessageHandler(message);

  //     expect(mockSqsService.changeMessageVisiblityTimeoutInQueueTransferEvents).toBeCalledWith(message, 0);
  //   });

  //   it('should call handleUploadAndTransferMove when file session is of type UPLOAD or TRANSFER', async () => {
  //     const message: Message = {
  //       MessageId: 'message-1',
  //       Attributes: { ApproximateReceiveCount: '3' },
  //       Body: JSON.stringify({ fileSessionId: 'fileSession-uuid-1' }),
  //     };

  //     const retrieveTransferInfoSpy = jest.spyOn(service, 'retrieveSessionInfo');
  //     retrieveTransferInfoSpy.mockResolvedValueOnce(mockTransferMoveTransferInfo);

  //     await service.onMessageHandler(message);

  //     expect(mockUploadAndTransferMoveService.handleUploadAndTransferMove).toBeCalledWith(
  //       mockTransferMoveTransferInfo,
  //       parseInt(message.Attributes!.ApproximateReceiveCount),
  //     );
  //     expect(mockSqsService.deleteMessageInQueueTransferEvents).toBeCalledWith(message);
  //   });
  // });
});
