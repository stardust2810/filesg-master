import mjml2html from 'mjml';

import { Activity } from '../../../entities/activity';
import { FileSGConfigService } from '../../../modules/setups/config/config.service';
import { DeletionData, EMAIL_TYPES } from '../../../utils/email-template';
import { EmailTemplate } from '../email-template.class';
import { activityMjmlTemplate } from './activity.email-template';

export interface DeletionTemplateArgs {
  activity: Activity;
  customMessage: string[];
  fileSGConfigService: FileSGConfigService;
}

export class DeletionEmail extends EmailTemplate {
  protected override generateEmailHeader({ activity }: DeletionTemplateArgs): string {
    return activity.transaction!.name;
  }

  protected override generateEmailContent({ activity, customMessage, fileSGConfigService }: DeletionTemplateArgs): string {
    const baseUrl = fileSGConfigService.systemConfig.fileSGBaseURL;
    const retrievalPageUrl = fileSGConfigService.notificationConfig.emailRetrievalPageUrl;
    const imageAssetsUrl = `${baseUrl}/assets/images/icons`;

    const { recipientInfo } = activity;
    const { code: agencyCode, name: agencyName } = activity.transaction!.application!.eservice!.agency!;
    const agencyCodeLowerCase = agencyCode.toLocaleLowerCase();

    const deletionData: DeletionData = {
      agencyIcon: `${imageAssetsUrl}/agency/${agencyCodeLowerCase}/logo.png`,
      agencyCode,
      agencyFullName: agencyName,
      transactionName: activity.transaction!.name,
      activityId: activity.uuid,
      recipientName: recipientInfo!.name,
      customMessage,
      fileList: activity.fileAssets!,
      baseUrl,
      imageAssetsUrl,
      externalRefId: activity.transaction!.application!.externalRefId || undefined,
      retrievalPageUrl,
    };
    return this.generateMjmlHTMLTemplate(deletionData);
  }

  // use handlebar lib when loading mjml string from S3
  protected generateMjmlHTMLTemplate({
    agencyCode,
    agencyFullName,
    transactionName,
    activityId,
    recipientName,
    customMessage,
    fileList,
    agencyIcon,
    baseUrl,
    imageAssetsUrl,
    externalRefId,
    retrievalPageUrl,
  }: DeletionData) {
    const currentDate = new Date();
    const deletionMjml = activityMjmlTemplate(EMAIL_TYPES.DELETION, {
      agencyCode,
      agencyFullName,
      transactionName,
      activityId,
      recipientName,
      customMessage,
      fileList: fileList!,
      agencyIcon,
      baseUrl,
      imageAssetsUrl,
      externalRefId,
      currentDate,
      retrievalPageUrl,
    });
    return mjml2html(deletionMjml, {}).html;
  }
}
