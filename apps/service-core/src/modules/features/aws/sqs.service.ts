import { Message } from '@aws-sdk/client-sqs';
import { SqsService as BaseSqsService } from '@filesg/aws';
import { SqsTransferEventsMessage } from '@filesg/backend-common';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  constructor(private readonly baseSqsService: BaseSqsService, private readonly fileSGConfigService: FileSGConfigService) {}

  async sendMessageToQueueTransferEvents(messageBody: SqsTransferEventsMessage) {
    const transferEventsQueue = this.fileSGConfigService.awsConfig.transferEventsQueueUrl;

    return await this.baseSqsService.sendMessageToSqs(transferEventsQueue, JSON.stringify(messageBody));
  }

  async receiveMessageFromQueueCoreEvents() {
    const coreEventsQueue = this.fileSGConfigService.awsConfig.coreEventsQueueUrl;

    return await this.baseSqsService.receiveMessageFromSqs(coreEventsQueue);
  }

  async receiveMessageFromQueueSesEvent() {
    const sesEventQueue = this.fileSGConfigService.awsConfig.sesEventQueueUrl;

    return await this.baseSqsService.receiveMessageFromSqs(sesEventQueue);
  }

  async deleteMessageInQueueCoreEvents(message: Message) {
    const coreEventsQueue = this.fileSGConfigService.awsConfig.coreEventsQueueUrl;

    return await this.baseSqsService.deleteMessageInSqs(coreEventsQueue, message);
  }

  async deleteMessageInQueueSesEvent(message: Message) {
    const sesEventQueue = this.fileSGConfigService.awsConfig.sesEventQueueUrl;

    return await this.baseSqsService.deleteMessageInSqs(sesEventQueue, message);
  }

  async changeMessageVisiblityTimeoutInQueueCoreEvents(message: Message, visibilityTimeout: number) {
    this.logger.log('Changing message visibility timeout in core-events queue');
    const coreEventsQueue = this.fileSGConfigService.awsConfig.coreEventsQueueUrl;

    try {
      return await this.baseSqsService.changeMessageVisibilityTimeout(coreEventsQueue, message, visibilityTimeout);
    } catch (error) {
      this.logger.error(`[SqsService - changeMessageVisiblityTimeoutInQueueCoreEvents] MessageId: ${message.MessageId}. Error: ${error}`);
    }
  }

  async changeMessageVisiblityTimeoutInQueueSesEvents(message: Message, visibilityTimeout: number) {
    this.logger.log('Changing message visibility timeout in ses-events queue');
    const sesEventsQueue = this.fileSGConfigService.awsConfig.sesEventQueueUrl;

    try {
      return await this.baseSqsService.changeMessageVisibilityTimeout(sesEventsQueue, message, visibilityTimeout);
    } catch (error) {
      this.logger.error(`[SqsService - changeMessageVisiblityTimeoutInQueueSesEvents] MessageId: ${message.MessageId}. Error: ${error}`);
    }
  }
}
