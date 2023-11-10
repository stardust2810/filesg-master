import { SqsService as BaseSqsService } from '@filesg/aws';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);

  constructor(private readonly baseSqsService: BaseSqsService, private readonly fileSgConfigService: FileSGConfigService) {}

  // ===========================================================================
  // Send
  // ===========================================================================
  public async sendMessageToQueueCoreEvents(message: string) {
    const queue = this.fileSgConfigService.awsConfig.sqsCoreEvents;
    this.logger.debug(queue);

    return await this.baseSqsService.sendMessageToSqs(queue, message);
  }
}
