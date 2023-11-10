import mjml2html from 'mjml';

import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { EmailTemplate } from './email-template.class';
import { virusOrScanErrorNotificationMjmlTemplate } from './virus-scan-error-notification.email-template';
const EMAIL_SUBJECT = 'Your file(s) has failed virus scanning';

export type VirusOrScanErrorNotificationTemplateArgs = {
  recipient: string;
  affectedFiles: string[];
  transactionId: string;
  externalRefId: string | null;
  fileSGConfigService: FileSGConfigService;
};

export class VirusOrScanErrorNotificationEmail extends EmailTemplate {
  protected override generateEmailHeader(): string {
    return EMAIL_SUBJECT;
  }
  protected override generateEmailContent(args: VirusOrScanErrorNotificationTemplateArgs): string {
    return this.generateMjmlHTMLTemplate(args);
  }

  protected generateMjmlHTMLTemplate({
    recipient,
    affectedFiles,
    transactionId,
    externalRefId,
    fileSGConfigService,
  }: VirusOrScanErrorNotificationTemplateArgs) {
    const baseUrl = fileSGConfigService.systemConfig.fileSGBaseURL;
    const imageAssetsUrl = `${baseUrl}/assets/images/icons`;
    const currentDate = new Date();
    const virusOrScanErrorNotificationTemplate = virusOrScanErrorNotificationMjmlTemplate({
      subject: EMAIL_SUBJECT,
      recipient,
      affectedFiles,
      transactionId,
      externalRefId,
      baseUrl,
      imageAssetsUrl,
      currentDate,
    });
    return mjml2html(virusOrScanErrorNotificationTemplate, {}).html;
  }
}
