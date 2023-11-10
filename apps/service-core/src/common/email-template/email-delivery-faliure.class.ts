import mjml2html from 'mjml';

import { emailDeliveryFailureMjmlTemplate } from './email-delivery-failure.email-template';
import { EmailTemplate } from './email-template.class';
const EMAIL_SUBJECT = 'Failed notification report for ';

export interface EmailDeliveryFailureTemplateArgs {
  notificationPeriod: string;
  eserviceName: string;
  recipientName: string;
  baseUrl: string;
}

export class EmailDeliveryFailureEmail extends EmailTemplate {
  protected override generateEmailHeader(args: EmailDeliveryFailureTemplateArgs): string {
    return EMAIL_SUBJECT + args.eserviceName;
  }
  protected override generateEmailContent(args: EmailDeliveryFailureTemplateArgs): string {
    return this.generateMjmlHTMLTemplate(args);
  }

  protected generateMjmlHTMLTemplate({
    recipientName,
    baseUrl,
    eserviceName: eserviceCode,
    notificationPeriod,
  }: EmailDeliveryFailureTemplateArgs) {
    const imageAssetsUrl = `${baseUrl}/assets/images/icons`;
    const currentDate = new Date();
    const issuanceDeliveryFailureMjml = emailDeliveryFailureMjmlTemplate({
      subject: EMAIL_SUBJECT + eserviceCode,
      recipientName,
      baseUrl,
      imageAssetsUrl,
      currentDate,
      eserviceCode,
      notificationPeriod,
    });
    return mjml2html(issuanceDeliveryFailureMjml, {}).html;
  }
}
