import mjml2html from 'mjml';

import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { EmailTemplate } from './email-template.class';
import {
  generateRecallEmailToAgencyEmailMjmlTemplate,
  RecallEmailToAgencyContentProps,
  RecallEmailToAgencyProps,
} from './recall-transaction-email-to-agency.email-template';

export enum RECALL_TRANSACTION_EMAIL_TYPE {
  SUCCESS,
  FAILURE,
}

export const RECALL_SUCCESS_EMAIL_TITLE = 'Your document transaction recall is successful';
export const RECALL_FAILURE_EMAIL_TITLE = 'Error recalling your document transaction(s)';

export interface RecallEmailToAgencyTemplateArgs extends RecallEmailToAgencyContentProps {
  fileSGConfigService: FileSGConfigService;
  recallTransactionEmailType: RECALL_TRANSACTION_EMAIL_TYPE;
}

export class RecallSuccessEmailToAgency extends EmailTemplate {
  protected generateEmailHeader({ recallTransactionEmailType }: RecallEmailToAgencyTemplateArgs): string {
    return recallTransactionEmailType === RECALL_TRANSACTION_EMAIL_TYPE.SUCCESS ? RECALL_SUCCESS_EMAIL_TITLE : RECALL_FAILURE_EMAIL_TITLE;
  }

  protected generateEmailContent({
    transactionUuid,
    timeOfRecallRequest,
    agencyName,
    agencyCode,
    requestorEmail,
    fileSGConfigService,
    recallTransactionEmailType,
    formSgRecallIssuanceErrorScenariosDocUrl,
  }: RecallEmailToAgencyTemplateArgs): string {
    const baseUrl = fileSGConfigService.systemConfig.fileSGBaseURL;
    const imageAssetsUrl = `${baseUrl}/assets/images/icons`;
    const currentDate = new Date();

    const recallEmailToAgencyProps: RecallEmailToAgencyProps = {
      baseUrl,
      imageAssetsUrl,
      currentDate,
      transactionUuid,
      timeOfRecallRequest,
      agencyName,
      agencyCode,
      requestorEmail,
      formSgRecallIssuanceErrorScenariosDocUrl,
    };

    return mjml2html(generateRecallEmailToAgencyEmailMjmlTemplate(recallEmailToAgencyProps, recallTransactionEmailType), {}).html;
  }
}
