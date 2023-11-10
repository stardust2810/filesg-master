import { Message } from '@aws-sdk/client-sqs';
import { SqsService as BaseSqsService } from '@filesg/aws';
import { SqsCoreEventsMessage } from '@filesg/backend-common';
import { EVENT } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { SqsService } from '../sqs.service';

export const mockBaseSqsService: MockService<BaseSqsService> = {
  sendMessageToSqs: jest.fn(),
  receiveMessageFromSqs: jest.fn(),
  deleteMessageInSqs: jest.fn(),
  changeMessageVisibilityTimeout: jest.fn(),
};

export const mockSqsService: MockService<SqsService> = {
  sendMessageToQueueCoreEvents: jest.fn(),
  receiveMessageFromQueueTransferEvents: jest.fn(),
  deleteMessageInQueueTransferEvents: jest.fn(),
  changeMessageVisiblityTimeoutInQueueTransferEvents: jest.fn(),
};

export const mockCoreEventsMessage: SqsCoreEventsMessage = {
  event: EVENT.FILE_SCAN_SUCCESS,
  payload: {
    fileAssetId: 'mockFileAssetUuid',
  },
};

export const mockSqsMessage: Message = {
  MessageId: 'mockMessageId',
};
