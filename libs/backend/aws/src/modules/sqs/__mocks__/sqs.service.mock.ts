import { Message } from '@aws-sdk/client-sqs';

export const mockQueue = 'mockQueue';

export const mockSqsMessageWithoutReceiptHandle: Message = {
  MessageId: 'mockMessageId',
};

export const mockSqsMessage: Message = {
  ReceiptHandle: 'mockReceiptHandle',
  ...mockSqsMessageWithoutReceiptHandle,
};
