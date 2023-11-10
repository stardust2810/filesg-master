import { Message } from '@aws-sdk/client-sqs';
import { SqsService as BaseSqsService } from '@filesg/aws';
import { LogMethod, SqsCoreEventsMessage } from '@filesg/backend-common';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);

  constructor(private readonly baseSqsService: BaseSqsService, private fileSGConfigService: FileSGConfigService) {}

  // ===========================================================================
  // Custom
  // ===========================================================================
  async sendMessageToQueueCoreEvents(messageBody: SqsCoreEventsMessage) {
    const coreEventsQueue = this.fileSGConfigService.awsConfig.coreEventsQueueUrl;

    return await this.baseSqsService.sendMessageToSqs(coreEventsQueue, JSON.stringify(messageBody));
  }

  async receiveMessageFromQueueTransferEvents() {
    const transferEventsQueue = this.fileSGConfigService.awsConfig.transferEventsQueueUrl;

    return await this.baseSqsService.receiveMessageFromSqs(transferEventsQueue);
  }

  @LogMethod()
  async deleteMessageInQueueTransferEvents(message: Message) {
    this.logger.log('Deleting message from transfer-events queue');
    const transferEventsQueue = this.fileSGConfigService.awsConfig.transferEventsQueueUrl;

    return await this.baseSqsService.deleteMessageInSqs(transferEventsQueue, message);
  }

  @LogMethod()
  async changeMessageVisiblityTimeoutInQueueTransferEvents(message: Message, visibilityTimeout: number) {
    this.logger.log('Changing message visibility timeout in transfer-events queue');
    const transferEventsQueue = this.fileSGConfigService.awsConfig.transferEventsQueueUrl;

    try {
      return await this.baseSqsService.changeMessageVisibilityTimeout(transferEventsQueue, message, visibilityTimeout);
    } catch (error) {
      this.logger.error(
        `[SqsService - changeMessageVisiblityTimeoutInQueueTransferEvents] MessageId: ${message.MessageId}. Error: ${error}`,
      );
    }
  }
}
