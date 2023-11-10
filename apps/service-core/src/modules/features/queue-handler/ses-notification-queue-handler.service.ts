import { Message } from '@aws-sdk/client-sqs';
import { SESEmailNotificationMessage, SNSMessage } from '@filesg/aws';
import { EmptyQueueMessageBodyException } from '@filesg/backend-common';
import { CI_ENVIRONMENT, COMPONENT_ERROR_CODE, FEATURE_TOGGLE } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

import { sleepInSecs } from '../../../utils/helpers';
import { NotificationHistoryEntityService } from '../../entities/notification-history/notification-history.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { SqsService } from '../aws/sqs.service';
import { TransactionalEmailHandlerService } from './events/email-type-handlers/transactional-email-handler.service';

@Injectable()
export class SesNotificationQueueHandlerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(SesNotificationQueueHandlerService.name);
  private readonly serviceName = SesNotificationQueueHandlerService.name;

  constructor(
    private readonly awsSQSService: SqsService,
    private readonly redisService: RedisService,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly notificationHistoryEntityService: NotificationHistoryEntityService,
    private readonly transactionalEmailHandlerService: TransactionalEmailHandlerService,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('Start polling after all modules initialized');

    // NOTE: disable queue polling on local or not using localstack
    if (
      this.fileSGConfigService.systemConfig.env === CI_ENVIRONMENT.LOCAL &&
      this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.OFF
    ) {
      this.logger.log('No polling on local env with useLocalstack off');
      return;
    }

    this.startPolling();
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`onApplicationShutdown shutting down signal ${signal}`);
  }

  private async startPolling() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.pollHandler();
    }
  }

  protected async pollHandler() {
    let messages: Message[] | undefined;

    try {
      messages = await this.awsSQSService.receiveMessageFromQueueSesEvent();
    } catch (error) {
      this.logger.error(`[SesEvent Queue] Failed to consume message from SQS. Error: ${JSON.stringify(error)}`);
    }

    // If there is no messages from the long poll, sleep 2s before doing another long poll
    if (!messages || !(messages.length > 0)) {
      await sleepInSecs(this.fileSGConfigService.systemConfig.pollingSleepTimeInSeconds);
      return;
    }

    await Promise.allSettled(messages.map((message) => this.onMessageHandler(message)));
  }

  protected async onMessageHandler(message: Message) {
    const sqsMessageId = message.MessageId;
    this.logger.log(`[SesEvent Queue] Processing message, SQS MessageId: ${sqsMessageId}`);

    try {
      if (!message.Body) {
        throw new EmptyQueueMessageBodyException(
          COMPONENT_ERROR_CODE.SES_QUEUE_HANDLER_SERVICE,
          this.fileSGConfigService.awsConfig.sesEventQueueUrl,
          sqsMessageId,
        );
      }

      const { Message } = JSON.parse(message.Body) as SNSMessage;
      const sesNotificationMessage = JSON.parse(Message) as SESEmailNotificationMessage;
      const sesMessageId = sesNotificationMessage.mail.messageId;

      const messageId = await this.redisService.get(FILESG_REDIS_CLIENT.SES_NOTIFICATION_DELIVERY, sesMessageId);

      if (messageId) {
        await this.transactionalEmailHandlerService.processMessage(sesNotificationMessage, true);
      } else {
        const notificationHistory = await this.notificationHistoryEntityService.retrieveNotificationHistoryByMessageId(sesMessageId);

        if (!notificationHistory) {
          //TODO: handle bounced email that are not transactional, add to blacklist
          this.logger.warn(
            `This message is not being processed as it doesnt exist in the transaction record, SES MessageId: ${sesMessageId}`,
          );
          return await this.awsSQSService.deleteMessageInQueueSesEvent(message);
        }

        await this.transactionalEmailHandlerService.processMessage(sesNotificationMessage);
      }

      await this.awsSQSService.deleteMessageInQueueSesEvent(message);
      this.logger.log(`[${this.serviceName} - onMessageHandler] SQS MessageId: ${sqsMessageId} processing end`);
    } catch (error) {
      this.logger.error(`[SesEvent Queue] Message processing failed, ${error}`);
      await this.awsSQSService.changeMessageVisiblityTimeoutInQueueSesEvents(message, 0);
    }
  }
}
