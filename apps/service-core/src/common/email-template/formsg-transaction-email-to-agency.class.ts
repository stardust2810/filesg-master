import mjml2html from 'mjml';

import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { EmailTemplate } from './email-template.class';
import {
  FormSgTransactionEmailToAgencyMjmlTemplateProps,
  generateEmailTitle,
  generateFormSgTransactionEmailToAgencyMjmlTemplate,
} from './formsg-transaction-email-to-agency.email-template';

export enum FORMSG_TRANSACTION_EMAIL_TYPE {
  SUCCESS,
  SUCESSS_WITH_FAIL_NOTIFICATION,
  SINGLE_FAILURE,
  BATCH_FAILURE,
  BATCH_SIDECAR_FAILURE,
}

export const FORMSG_TRANSACTION_SUCCESS_EMAIL_TITLE = 'Your document issuance is successful - Manual Issuance';
export const FORMSG_TRANSACTION_SUCCESS_WITH_FAIL_NOTIFICATION_EMAIL_TITLE = 'Unable to notify recipient(s) - Manual Issuance';
export const FORMSG_TRANSACTION_FAILURE_EMAIL_TITLE = 'Error issuing your documents - Manual Issuance';

export interface FormSgTransactionEmailToAgencyTemplateArgs
  extends Omit<FormSgTransactionEmailToAgencyMjmlTemplateProps, 'baseUrl' | 'imageAssetsUrl' | 'currentDate'> {
  fileSGConfigService: FileSGConfigService;
}

export class FormSgTransactionEmailToAgency extends EmailTemplate {
  protected generateEmailHeader({ general: { emailType }, transaction }: FormSgTransactionEmailToAgencyTemplateArgs): string {
    const isBatch = !transaction;
    return generateEmailTitle(emailType, isBatch);
  }

  protected generateEmailContent({ fileSGConfigService, ...rest }: FormSgTransactionEmailToAgencyTemplateArgs): string {
    const baseUrl = fileSGConfigService.systemConfig.fileSGBaseURL;
    const imageAssetsUrl = `${baseUrl}/assets/images/icons`;
    const currentDate = new Date();

    const formSgTransactionEmailToAgencyProps: FormSgTransactionEmailToAgencyMjmlTemplateProps = {
      baseUrl,
      imageAssetsUrl,
      currentDate,
      ...rest,
    };

    return mjml2html(generateFormSgTransactionEmailToAgencyMjmlTemplate(formSgTransactionEmailToAgencyProps)).html;
  }
}
