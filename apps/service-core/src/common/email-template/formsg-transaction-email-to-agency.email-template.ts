/* eslint-disable sonarjs/no-duplicate-string */
import {
  FORMSG_TRANSACTION_EMAIL_TYPE,
  FORMSG_TRANSACTION_FAILURE_EMAIL_TITLE,
  FORMSG_TRANSACTION_SUCCESS_EMAIL_TITLE,
  FORMSG_TRANSACTION_SUCCESS_WITH_FAIL_NOTIFICATION_EMAIL_TITLE,
} from './formsg-transaction-email-to-agency.class';
import { fileSgEmailTemplate, FsgEmailProps } from './mjml-helper';

type BoldVariant = 'full' | 'semi';

interface SuccessIssuanceSection {
  fileSgBaseUrl: string;
  formSgRecallIssuanceFormUrl: string;
}

interface SuccessIssuanceWithFailedNotificationSection {
  fileSgBaseUrl: string;
  formSgRecallIssuanceFormUrl: string;
  formSgIssuanceErrorScenariosDocUrl: string;
}

interface SingleFailureIssuanceSection {
  formSgIssuanceErrorScenariosDocUrl: string;
}

interface BatchSidecarValidationFailureSection {
  failSubType: string;
  formSgIssuanceErrorScenariosDocUrl: string;
}

interface BatchFailureIssuanceSection {
  fileSgBaseUrl: string;
  formSgIssuanceErrorScenariosDocUrl: string;
  totalTransactionCount: number;
  failedTransactionCount: number;
  hasNotificationToRecipientFailure: boolean;
}

export type GeneralInfoSection =
  | ({ emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS } & SuccessIssuanceSection)
  | ({ emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION } & SuccessIssuanceWithFailedNotificationSection)
  | ({ emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE } & SingleFailureIssuanceSection)
  | ({ emailType: FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE } & BatchSidecarValidationFailureSection)
  | ({ emailType: FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE } & BatchFailureIssuanceSection);

interface TransactionInfoSection {
  applicationType: string;
  transactionName: string;
  fileNames: string[];
  recipientNames: string[];
  transactionUuid?: string;
}

interface FormSgIssuanceInfoSection {
  dateTimeOfIssuanceRequest: string;
  formSgSubmissionId: string;
  requestorEmail: string;
}

export type FormSgTransactionEmailToAgencyMjmlTemplateProps = {
  general: GeneralInfoSection;
  transaction?: TransactionInfoSection;
  issuance: FormSgIssuanceInfoSection;
} & Required<Pick<FsgEmailProps, 'baseUrl' | 'imageAssetsUrl' | 'currentDate'>>;

const appendIssuanceTypeInfo = (text: string, isBatch?: boolean) => {
  return `${text} ${isBatch ? '(Batch)' : '(Single)'}`;
};

export const generateEmailTitle = (emailType: FORMSG_TRANSACTION_EMAIL_TYPE, isBatch?: boolean) => {
  switch (emailType) {
    case FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS:
      return appendIssuanceTypeInfo(FORMSG_TRANSACTION_SUCCESS_EMAIL_TITLE, isBatch);
    case FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION:
      return appendIssuanceTypeInfo(FORMSG_TRANSACTION_SUCCESS_WITH_FAIL_NOTIFICATION_EMAIL_TITLE, isBatch);
    case FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE:
    case FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE:
    case FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE:
      return appendIssuanceTypeInfo(FORMSG_TRANSACTION_FAILURE_EMAIL_TITLE, isBatch);
  }
};

const generateMjmlFieldLabel = (text: string) => {
  return `<mj-text mj-class='field-label'><h3>${text}</h3></mj-text>`;
};

const generateMjmlFieldText = (text: string, bold?: BoldVariant) => {
  const boldClass = bold ? `class="bold-${bold}"` : '';
  return `<mj-text><p ${boldClass}>${text}</p></mj-text>`;
};

const generateMjmlFieldTexts = (texts: string[], bold?: BoldVariant) => {
  return texts.reduce((prev, cur) => {
    const mjmlStr = generateMjmlFieldText(cur, bold);
    return prev + mjmlStr;
  }, '');
};

const generateEmailHeaderSection = (emailType: FORMSG_TRANSACTION_EMAIL_TYPE, isBatch?: boolean) => {
  return `
    <mj-section>
      <mj-column mj-class='content-col' padding-bottom='16px'>
        <mj-text mj-class='primary-color'>
          <h1 class='bold-full'>${generateEmailTitle(emailType, isBatch)}</h1>
        </mj-text>
      </mj-column>
    </mj-section>
  
    <mj-section>
      <mj-column mj-class='content-col' padding-bottom='8px'>
        <mj-text>
          <p><strong>To Agency Officer,</strong></p>
        </mj-text>
      </mj-column>
    </mj-section>
  `;
};

const generateSuccessIssuanceSection = ({ fileSgBaseUrl, formSgRecallIssuanceFormUrl }: SuccessIssuanceSection) => {
  return `<mj-section>
      <mj-column mj-class='content-col' padding-bottom='24px'>
        ${generateMjmlFieldText('FileSG has successfully processed your document issuance.')}
        <mj-spacer height='8px' />
        ${generateMjmlFieldText(
          `The recipient is now able to access the documents on FileSG’s web portal - <a href='${fileSgBaseUrl}' target='_blank'>${fileSgBaseUrl}</a>.`,
        )}
        <mj-spacer height='8px' />
        ${generateMjmlFieldText('We have also sent out a notification email to the recipient.')}
        <mj-spacer height='8px' />
        ${generateMjmlFieldText('You may find more details in the attached report (CSV file).')}
        <mj-spacer height='8px' />
        ${generateMjmlFieldText(
          `Should there be a mistake in the issuance, you may recall the issued documents by submitting the <a href='${formSgRecallIssuanceFormUrl}' target='_blank'>FileSG Document Transaction Recall form</a>, or approach your e-Service representative to contact FileSG for assistance.`,
        )}
      </mj-column>
    </mj-section>`;
};

const generateSuccessIssuanceWithFailedNotificationSection = ({
  fileSgBaseUrl,
  formSgIssuanceErrorScenariosDocUrl,
  formSgRecallIssuanceFormUrl,
}: SuccessIssuanceWithFailedNotificationSection) => {
  return `<mj-section>
      <mj-column mj-class='content-col' padding-bottom='24px'>
        ${generateMjmlFieldText('FileSG has successfully processed your document issuance.')}
        <mj-spacer height='8px' />
        ${generateMjmlFieldText(
          `The recipient is now able to access the documents on FileSG’s web portal - <a href='${fileSgBaseUrl}' target='_blank'>${fileSgBaseUrl}</a>.`,
        )}
        <mj-spacer height='8px' />
        ${generateMjmlFieldText('However, we encountered errors when sending out the notification email to the recipient.', 'full')}
        <mj-spacer height='8px' />
        ${generateMjmlFieldText('You may find more details in the attached report (CSV file).')}
        <mj-spacer height='8px' />
        <mj-text>
          <p>
            You may refer to the <a href='${formSgIssuanceErrorScenariosDocUrl}' target='_blank'>possible error scenarios</a> and take the necessary remedial actions.
          </p>
        </mj-text>
        <mj-spacer height='8px' />
        ${generateMjmlFieldText(
          `Should there be a mistake in the issuance, you may recall the issued documents by submitting the <a href='${formSgRecallIssuanceFormUrl}' target='_blank'>FileSG Document Transaction Recall form</a>, or approach your e-Service representative to contact FileSG for assistance.`,
        )}
      </mj-column>
    </mj-section>`;
};

const generateSingleFailureIssuanceSection = ({ formSgIssuanceErrorScenariosDocUrl }: SingleFailureIssuanceSection) => {
  return `<mj-section>
    <mj-column mj-class='content-col' padding-bottom='24px'>
      ${generateMjmlFieldText('FileSG was unable to process your document transaction.')}
      <mj-spacer height='8px' />
      ${generateMjmlFieldText('You may find more details in the attached report (CSV file).')}
      <mj-spacer height='8px' />
      <mj-text>
        <p>
          You may refer to the <a href='${formSgIssuanceErrorScenariosDocUrl}' target='_blank'>possible error scenarios</a> and take the necessary remedial actions before issuing the document(s) again.
        </p>
      </mj-text>
    </mj-column>
  </mj-section>`;
};

const generateBatchSidecarValidationFailureSection = ({
  failSubType,
  formSgIssuanceErrorScenariosDocUrl,
}: BatchSidecarValidationFailureSection) => {
  return `<mj-section>
    <mj-column mj-class='content-col' padding-bottom='24px'>
      ${generateMjmlFieldText(
        'FileSG was unable to process your document transactions due to the following error with the Sidecar ZIP File you uploaded:',
      )}
      <mj-spacer height='8px' />
      ${generateMjmlFieldText(failSubType, 'full')}
      <mj-spacer height='8px' />
      <mj-text>
        <p>
          You may refer to the <a href='${formSgIssuanceErrorScenariosDocUrl}' target='_blank'>possible error scenarios</a> and take the necessary remedial actions before issuing the document(s) again.
        </p>
      </mj-text>
    </mj-column>
  </mj-section>`;
};

const generateBatchFailureIssuanceSection = ({
  fileSgBaseUrl,
  formSgIssuanceErrorScenariosDocUrl,
  totalTransactionCount,
  failedTransactionCount,
  hasNotificationToRecipientFailure,
}: BatchFailureIssuanceSection) => {
  return `<mj-section>
    <mj-column mj-class='content-col' padding-bottom='24px'>
      ${generateMjmlFieldText(
        `FileSG was unable to process ${failedTransactionCount} out of ${totalTransactionCount} of your document transactions.`,
      )}
      <mj-spacer height='8px' />
      ${generateMjmlFieldText(
        `For the documents that were successfully issued, the recipients are now able to access the documents on FileSG’s web portal - <a href='${fileSgBaseUrl}' target='_blank'>${fileSgBaseUrl}</a>.`,
      )}
      <mj-spacer height='8px' />
      ${generateMjmlFieldText('We have also sent out a notification email to each of these recipients.')}
      <mj-spacer height='8px' />
      ${
        hasNotificationToRecipientFailure &&
        `${generateMjmlFieldText('However, we encountered errors when sending out the notification emails to these recipients.', 'full')}
      <mj-spacer height='8px' />`
      }
      ${generateMjmlFieldText('You may find more details in the attached report (CSV file).')}
      <mj-spacer height='8px' />
      <mj-text>
        <p>
          You may refer to the <a href='${formSgIssuanceErrorScenariosDocUrl}' target='_blank'>possible error scenarios</a> and take the necessary remedial actions before issuing the document(s) again.
        </p>
      </mj-text>
    </mj-column>
  </mj-section>`;
};

const generateGeneralInfoSection = (generalInfo: GeneralInfoSection) => {
  const { emailType } = generalInfo;

  switch (emailType) {
    case FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS: {
      const { fileSgBaseUrl, formSgRecallIssuanceFormUrl } = generalInfo;
      return generateSuccessIssuanceSection({ fileSgBaseUrl, formSgRecallIssuanceFormUrl });
    }

    case FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION: {
      const { fileSgBaseUrl, formSgRecallIssuanceFormUrl, formSgIssuanceErrorScenariosDocUrl } = generalInfo;
      return generateSuccessIssuanceWithFailedNotificationSection({
        fileSgBaseUrl,
        formSgRecallIssuanceFormUrl,
        formSgIssuanceErrorScenariosDocUrl,
      });
    }

    case FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE: {
      const { formSgIssuanceErrorScenariosDocUrl } = generalInfo;
      return generateSingleFailureIssuanceSection({ formSgIssuanceErrorScenariosDocUrl });
    }

    case FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE: {
      const { failSubType, formSgIssuanceErrorScenariosDocUrl } = generalInfo;
      return generateBatchSidecarValidationFailureSection({ failSubType, formSgIssuanceErrorScenariosDocUrl });
    }

    case FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE: {
      const {
        fileSgBaseUrl,
        formSgIssuanceErrorScenariosDocUrl,
        totalTransactionCount,
        failedTransactionCount,
        hasNotificationToRecipientFailure,
      } = generalInfo;
      return generateBatchFailureIssuanceSection({
        fileSgBaseUrl,
        formSgIssuanceErrorScenariosDocUrl,
        totalTransactionCount,
        failedTransactionCount,
        hasNotificationToRecipientFailure,
      });
    }
  }
};

const generateTransactionInfoSection = ({
  applicationType,
  transactionName,
  fileNames,
  recipientNames,
  transactionUuid,
}: TransactionInfoSection) => {
  const fileNamesMjmlStr = generateMjmlFieldTexts(fileNames, 'semi');
  const recipientsMjmlStr = generateMjmlFieldTexts(recipientNames, 'semi');

  return `
    <mj-section>
      <mj-column mj-class='content-col'>
        <mj-divider border-color="#C6C6C6" border-width='1px' width='100%' padding='0' padding-bottom='24px' />
      </mj-column>
    </mj-section>
  
    <mj-section>
      <mj-column mj-class='content-col' padding-bottom='24px'>
        ${generateMjmlFieldLabel('Application Type')}
        ${generateMjmlFieldText(applicationType, 'semi')}
        <mj-spacer height='12px' />

        ${generateMjmlFieldLabel('Activity Title / Transaction Name')}
        ${generateMjmlFieldText(transactionName, 'semi')}
        <mj-spacer height='12px' />

        ${generateMjmlFieldLabel('Filename(s)')}
        ${fileNamesMjmlStr}
        <mj-spacer height='12px' />

        ${generateMjmlFieldLabel('Recipient Name(s)')}
        ${recipientsMjmlStr}

        ${
          transactionUuid &&
          `
          <mj-spacer height='12px' />
          ${generateMjmlFieldLabel('Transaction UUID')}
          ${generateMjmlFieldText(transactionUuid, 'semi')}`
        }
      </mj-column>
    </mj-section>`;
};

const generateFormSgIssuanceInfoSection = ({
  dateTimeOfIssuanceRequest,
  formSgSubmissionId,
  requestorEmail,
}: FormSgIssuanceInfoSection) => {
  return `
    <mj-section>
      <mj-column mj-class='content-col'>
        <mj-divider border-color="#C6C6C6" border-width='1px' width='100%' padding='0' padding-bottom='24px' />
      </mj-column>
    </mj-section>

    <mj-section>
    <mj-column mj-class='content-col'>
      ${generateMjmlFieldLabel('Date & Time of Issuance Request')}
      ${generateMjmlFieldText(dateTimeOfIssuanceRequest, 'semi')}
      <mj-spacer height='12px' />

      ${generateMjmlFieldLabel('FormSG Response ID')}
      ${generateMjmlFieldText(formSgSubmissionId, 'semi')}
      <mj-spacer height='12px' />

      ${generateMjmlFieldLabel('Submitted by')}
      ${generateMjmlFieldText(requestorEmail, 'semi')}
    </mj-column>
  </mj-section>`;
};

const generateFormSgTransactionEmailTemplate = (
  generalInfoSection: GeneralInfoSection,
  issuanceInfoSection: FormSgIssuanceInfoSection,
  transactionInfoSection?: TransactionInfoSection,
) => {
  const { emailType } = generalInfoSection;

  let template = generateEmailHeaderSection(emailType, !transactionInfoSection) + generateGeneralInfoSection(generalInfoSection);

  if (transactionInfoSection) {
    template += generateTransactionInfoSection(transactionInfoSection);
  }

  template += generateFormSgIssuanceInfoSection(issuanceInfoSection);

  return template;
};

export const generateFormSgTransactionEmailToAgencyMjmlTemplate = ({
  baseUrl,
  imageAssetsUrl,
  currentDate = new Date(),
  general,
  transaction,
  issuance,
}: FormSgTransactionEmailToAgencyMjmlTemplateProps) => {
  return fileSgEmailTemplate(
    { baseUrl, imageAssetsUrl, currentDate },
    generateFormSgTransactionEmailTemplate(general, issuance, transaction),
  );
};
