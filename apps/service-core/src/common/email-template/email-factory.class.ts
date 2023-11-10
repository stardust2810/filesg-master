import { COMPONENT_ERROR_CODE } from '@filesg/common';

import { EMAIL_TYPES } from '../../utils/email-template';
import { IssuanceEmailClassNotFoundException } from '../filters/custom-exceptions.filter';
import { CancellationEmail, CancellationTemplateArgs } from './activity-emails/cancellation.class';
import { DeletionEmail, DeletionTemplateArgs } from './activity-emails/deletion.class';
import { IssuanceEmail, IssuanceTemplateArgs } from './activity-emails/issuance.class';
import { EmailDeliveryFailureEmail, EmailDeliveryFailureTemplateArgs } from './email-delivery-faliure.class';
import { EmailTemplate } from './email-template.class';
import { FormSgTransactionEmailToAgency, FormSgTransactionEmailToAgencyTemplateArgs } from './formsg-transaction-email-to-agency.class';
import { RecallEmailToAgencyTemplateArgs, RecallSuccessEmailToAgency } from './recall-transaction-email-to-agency.class';
import { VirusOrScanErrorNotificationEmail, VirusOrScanErrorNotificationTemplateArgs } from './virus-scan-error-notification.class';

export type TransactionalEmailTemplateTypes =
  | EMAIL_TYPES.ISSUANCE
  | EMAIL_TYPES.CANCELLATION
  | EMAIL_TYPES.DELETION
  | EMAIL_TYPES.EMAIL_DELIVERY_FAILED
  | EMAIL_TYPES.VIRUS_SCAN_ERROR
  | EMAIL_TYPES.RECALL
  | EMAIL_TYPES.FORMSG;

export type FuncArgs = {
  [EMAIL_TYPES.ISSUANCE]: IssuanceTemplateArgs;
  [EMAIL_TYPES.CANCELLATION]: CancellationTemplateArgs;
  [EMAIL_TYPES.DELETION]: DeletionTemplateArgs;
  [EMAIL_TYPES.EMAIL_DELIVERY_FAILED]: EmailDeliveryFailureTemplateArgs;
  [EMAIL_TYPES.VIRUS_SCAN_ERROR]: VirusOrScanErrorNotificationTemplateArgs;
  [EMAIL_TYPES.RECALL]: RecallEmailToAgencyTemplateArgs;
  [EMAIL_TYPES.FORMSG]: FormSgTransactionEmailToAgencyTemplateArgs;
};

export class EmailFactory {
  private static emailTemplateMap: Record<TransactionalEmailTemplateTypes, EmailTemplate> = {
    issuance: new IssuanceEmail(),
    emailDeliveryFailed: new EmailDeliveryFailureEmail(),
    cancellation: new CancellationEmail(),
    virusOrScanError: new VirusOrScanErrorNotificationEmail(),
    deletion: new DeletionEmail(),
    recall: new RecallSuccessEmailToAgency(),
    formSg: new FormSgTransactionEmailToAgency(),
  };

  static build<T extends TransactionalEmailTemplateTypes>(emailTemplateType: T, args: FuncArgs[T]) {
    const emailTemplateInstance = this.emailTemplateMap[emailTemplateType];

    if (!emailTemplateInstance) {
      throw new IssuanceEmailClassNotFoundException(COMPONENT_ERROR_CODE.EMAIL_FACTORY_TEMPLATE, emailTemplateType);
    }

    return emailTemplateInstance.generateEmail(args);
  }
}
