import mjml2html from 'mjml';

import { Activity } from '../../../entities/activity';
import { FileSGConfigService } from '../../../modules/setups/config/config.service';
import { EMAIL_TYPES, IssuanceData } from '../../../utils/email-template';
import { EmailTemplate } from '../email-template.class';
import { activityMjmlTemplate } from './activity.email-template';

export interface FileEncryptionDetails {
  fileAssetUuid: string;
  isPasswordEncrypted?: boolean;
}

export interface ActivityEncryptionDetails {
  activityUuid: string;
  files: FileEncryptionDetails[];
  password?: string;
}

export interface IssuanceTemplateArgs {
  activity: Activity;
  fileSGConfigService: FileSGConfigService;
  customMessage: string[];
  encryptionDetails?: ActivityEncryptionDetails;
}

export class IssuanceEmail extends EmailTemplate {
  protected override generateEmailHeader({ activity }: IssuanceTemplateArgs): string {
    return activity.transaction!.name;
  }

  protected override generateEmailContent({
    activity,
    fileSGConfigService,
    customMessage,
    encryptionDetails,
  }: IssuanceTemplateArgs): string {
    const { recipientInfo } = activity;
    const baseUrl = fileSGConfigService.systemConfig.fileSGBaseURL;
    const retrievalPageUrl = fileSGConfigService.notificationConfig.emailRetrievalPageUrl;
    const imageAssetsUrl = `${baseUrl}/assets/images/icons`;
    const { code: agencyCode, name: agencyName } = activity.transaction!.application!.eservice!.agency!;
    const agencyCodeLowerCase = agencyCode.toLocaleLowerCase();

    const issuanceData: IssuanceData = {
      agencyIcon: `${imageAssetsUrl}/agency/${agencyCodeLowerCase}/logo.png`,
      agencyCode: agencyCodeLowerCase,
      agencyFullName: agencyName,
      transactionName: activity.transaction!.name,
      activityId: activity.uuid,
      recipientName: recipientInfo!.name,
      customMessage,
      fileList: activity.fileAssets,
      baseUrl,
      retrievalPageUrl,
      imageAssetsUrl,
      externalRefId: activity.transaction!.application!.externalRefId || undefined,
      password: encryptionDetails?.password, //TODO: email template only caters for encryption of all files / no encryption
    };
    return this.generateMjmlHTMLTemplate(issuanceData);
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
    password,
    retrievalPageUrl,
  }: IssuanceData) {
    const currentDate = new Date();
    const issuanceMjml = activityMjmlTemplate(EMAIL_TYPES.ISSUANCE, {
      agencyCode,
      agencyFullName,
      transactionName,
      activityId,
      recipientName,
      customMessage,
      fileList: fileList!,
      agencyIcon,
      baseUrl,
      retrievalPageUrl,
      imageAssetsUrl,
      externalRefId,
      currentDate,
      password,
    });
    return mjml2html(issuanceMjml, {}).html;
  }
}
