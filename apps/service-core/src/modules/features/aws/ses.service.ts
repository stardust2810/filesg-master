import { EmailAttachment, SesService as BaseSesService } from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class SesService {
  private readonly logger = new Logger(SesService.name);

  constructor(private readonly baseSesService: BaseSesService, private readonly fileSGConfigService: FileSGConfigService) {}

  public async sendEmailFromFileSG(
    receivers: string[],
    emailTitle: string,
    emailContent: string,
    agencyCode?: string,
    attachments?: EmailAttachment[],
  ) {
    const sender = agencyCode
      ? `${agencyCode} (via FileSG) <${this.fileSGConfigService.notificationConfig.senderAddress}>`
      : `FileSG <${this.fileSGConfigService.notificationConfig.senderAddress}>`;

    // to not call sendEmail when on localstack
    const isLocalstackOn = this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;
    if (isLocalstackOn) {
      return { MessageId: `localstack-message-id-${Date.now()}` };
    }

    return attachments && attachments.length > 0
      ? await this.baseSesService.sendEmailWithAttachments(sender, receivers, emailTitle, emailContent, attachments)
      : await this.baseSesService.sendEmail(sender, receivers, emailTitle, emailContent);
  }
}
