import { SqsService as BaseSqsService } from '@filesg/aws';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);

  constructor(private readonly baseSqsService: BaseSqsService, private readonly fileSGConfigService: FileSGConfigService) {}

  async deleteMessageInQueueSftpProcessor(messageId: string, msgReceiptHandle: string) {
    const sftpProcessorQueue = this.fileSGConfigService.awsConfig.sqsSftpProcessor;

    return await this.baseSqsService.deleteMessageInSqs(sftpProcessorQueue, messageId, msgReceiptHandle);
  }
}
