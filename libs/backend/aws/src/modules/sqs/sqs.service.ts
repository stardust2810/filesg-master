import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { AWSHttpException } from '../../common/filters/custom-exceptions';
import { LOG_OPERATION_NAME_PREFIX, SQS_MESSAGE_REQUIRED_ATTRIBUTE_LIST, SQS_WAIT_TIME_SECONDS } from '../../const';
import { SQS_CLIENT } from '../../typings/sqs.typing';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);

  constructor(@Inject(SQS_CLIENT) private readonly sqs: SQSClient) {}

  public async sendMessageToSqs(queueUrl: string, message: string) {
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.SQS} Sending message to queue`;
    this.logger.log(taskMessage);
    this.logger.debug(message);

    try {
      const sendMessageCommand = new SendMessageCommand({
        MessageBody: message,
        QueueUrl: queueUrl,
      });

      const data = await this.sqs.send(sendMessageCommand);
      this.logger.log(`[Success] ${taskMessage}`);

      return data;
    } catch (error) {
      // AWS error handling issue https://github.com/aws/aws-sdk-js-v3/issues/2007
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.SQS_SERVICE, errorMessage);
    }
  }

  public async receiveMessageFromSqs(queueUrl: string, maxNumberOfMessages = 10) {
    // FIXME: log?
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.SQS} Polling for messages`;
    this.logger.debug(taskMessage);

    try {
      const receiveMessageCommand = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        AttributeNames: SQS_MESSAGE_REQUIRED_ATTRIBUTE_LIST,
        MaxNumberOfMessages: maxNumberOfMessages,
        WaitTimeSeconds: SQS_WAIT_TIME_SECONDS,
      });

      const { Messages } = await this.sqs.send(receiveMessageCommand);

      // Only log if there are messages
      const messageCount = Messages?.length ?? 0;
      if (messageCount > 0) {
        this.logger.log(`[Success] ${taskMessage}, Message count: ${messageCount}`);
      }

      return Messages;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.SQS_SERVICE, errorMessage);
    }
  }

  public async deleteMessageInSqs(queueUrl: string, message: Message): Promise<void>;
  public async deleteMessageInSqs(queueUrl: string, messageId: Message | string, msgReceiptHandle: string): Promise<void>;
  public async deleteMessageInSqs(queueUrl: string, message: Message | string, msgReceiptHandle?: string): Promise<void> {
    const messageId = typeof message === 'string' ? message : message.MessageId;
    const receiptHandle = typeof message === 'string' ? msgReceiptHandle : message.ReceiptHandle;

    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.SQS} Deleting message from queue: ${messageId}`;
    this.logger.log(taskMessage);

    try {
      if (!receiptHandle) {
        throw new Error(`Unable to delete message from queue: Message ${messageId} missing receipt handle`);
      }

      const deleteMessageCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqs.send(deleteMessageCommand);
      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.SQS_SERVICE, errorMessage);
    }
  }

  // gd TODO: add test
  public async changeMessageVisibilityTimeout(queueUrl: string, message: Message, visibilityTimeout: number): Promise<void> {
    const messageId = message.MessageId;
    const receiptHandle = message.ReceiptHandle;

    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.SQS} Changing visibility timeout of message ${messageId} to ${visibilityTimeout}`;
    this.logger.log(taskMessage);

    try {
      if (!receiptHandle) {
        throw new Error(`Unable to update message visibility timeout: Message ${messageId} missing receipt handle`);
      }

      const changeVisibilityTimeoutCommand = new ChangeMessageVisibilityCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: visibilityTimeout,
      });

      await this.sqs.send(changeVisibilityTimeoutCommand);
      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.SQS_SERVICE, errorMessage);
    }
  }
}
