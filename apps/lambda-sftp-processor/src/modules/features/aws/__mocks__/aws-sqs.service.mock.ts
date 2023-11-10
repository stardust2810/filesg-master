import { SqsService as BaseSqsService } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { SqsService } from '../sqs.service';

export const mockBaseSqsService: MockService<BaseSqsService> = {
  sendMessageToSqs: jest.fn(),
  receiveMessageFromSqs: jest.fn(),
  deleteMessageInSqs: jest.fn(),
  changeMessageVisibilityTimeout: jest.fn(),
};

export const mockSqsService: MockService<SqsService> = {
  deleteMessageInQueueSftpProcessor: jest.fn(),
};

export const mockMessageId = 'mockMessageId';
export const mockMsgReceiptHandle = 'mockMsgReceiptHandle';
