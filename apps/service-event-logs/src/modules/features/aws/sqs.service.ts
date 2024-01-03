import { SqsService as BaseSqsService } from '@filesg/aws';
import { SqsCoreEventsMessage } from '@filesg/backend-common';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  constructor(private readonly baseSqsService: BaseSqsService, private readonly fileSGConfigService: FileSGConfigService) {}

  async sendMessageToQueueCoreEvents(messageBody: SqsCoreEventsMessage) {
    const coreEventsQueue = this.fileSGConfigService.awsConfig.coreEventsQueueUrl;

    return await this.baseSqsService.sendMessageToSqs(coreEventsQueue, JSON.stringify(messageBody));
  }
}
