import { fileSgEmailTemplate, FsgEmailProps } from './mjml-helper';
import {
  RECALL_FAILURE_EMAIL_TITLE,
  RECALL_SUCCESS_EMAIL_TITLE,
  RECALL_TRANSACTION_EMAIL_TYPE,
} from './recall-transaction-email-to-agency.class';

export interface RecallEmailToAgencyContentProps {
  transactionUuid: string;
  timeOfRecallRequest: string;
  agencyName: string;
  agencyCode: string;
  formSgRecallIssuanceErrorScenariosDocUrl: string;
  requestorEmail?: string;
}

export type RecallEmailToAgencyProps = RecallEmailToAgencyContentProps & FsgEmailProps;

const emailHeaderSection = (recallTransactionEmailType: RECALL_TRANSACTION_EMAIL_TYPE) => {
  return `
  <mj-section>
    <mj-column mj-class='content-col' padding-bottom='16px'>
      <mj-text mj-class='primary-color'>
        <h1 class='bold-full'>${
          recallTransactionEmailType === RECALL_TRANSACTION_EMAIL_TYPE.SUCCESS ? RECALL_SUCCESS_EMAIL_TITLE : RECALL_FAILURE_EMAIL_TITLE
        }</h1>
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

const emailBodySection = (
  recallTransactionEmailType: RECALL_TRANSACTION_EMAIL_TYPE,
  formSgRecallIssuanceErrorScenariosDocUrl: string,
): string => {
  if (recallTransactionEmailType === RECALL_TRANSACTION_EMAIL_TYPE.SUCCESS) {
    return `
    <mj-section>
      <mj-column mj-class='content-col' padding-bottom='24px'>
        <mj-text>
          <p>
            FileSG has recalled the document transaction you requested for and removed the files that were previously issued.
          </p>
        </mj-text>
        <mj-spacer height='8px' />
        <mj-text>
          <p>
            The recipients will no longer be able to view or access the associated files and activities.
          </p>
        </mj-text>
        <mj-spacer height='8px' />
        <mj-text>
          <p>
            You may find more details in the report attached (CSV file).
          </p>
        </mj-text>
      </mj-column>
    </mj-section>
    `;
  } else {
    return `
      <mj-section>
        <mj-column mj-class='content-col' padding-bottom='24px'>
          <mj-text>
            <p>
              There was an error recalling the document transaction(s) you requested for. 
            </p>
          </mj-text>
          <mj-spacer height='8px' />
          <mj-text>
            <p>
              You may find more details in the report attached (CSV file).
            </p>
          </mj-text>
          <mj-spacer height='8px' />
          <mj-text>
            <p>
              You may refer to the <a href='${formSgRecallIssuanceErrorScenariosDocUrl}' target='_blank'>possible error scenarios</a> and take the necessary remedial actions before recalling the failed transaction(s) again.
            </p>
          </mj-text>
        </mj-column>
      </mj-section>
    `;
  }
};

const emailFooterSection = ({ transactionUuid, timeOfRecallRequest, requestorEmail }: RecallEmailToAgencyContentProps) => {
  return `
  <mj-section>
    <mj-column mj-class='content-col'>
      <mj-divider border-color="#C6C6C6" border-width='1px' width='100%' padding='0' padding-bottom='24px' />
    </mj-column>
  </mj-section>

  <mj-section>
    <mj-column mj-class='content-col' >

      <mj-text mj-class='field-label'>
        <h3>Transaction UUID</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'>${transactionUuid}</p>
      </mj-text>
      <mj-spacer height='12px' />

      <mj-text mj-class='field-label'>
        <h3>Date & Time of Recall Request</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'>${timeOfRecallRequest}</p>
      </mj-text>
      <mj-spacer height='12px' />

      ${
        requestorEmail &&
        `<mj-text mj-class='field-label'>
        <h3>Submitted by</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'>${requestorEmail}</p>
      </mj-text>`
      }
    </mj-column>
  </mj-section>
  `;
};

const generateRecallEmailTemplate = (
  recallEmailToAgencyContentProps: RecallEmailToAgencyContentProps,
  recallTransactionEmailType: RECALL_TRANSACTION_EMAIL_TYPE,
) => {
  return (
    emailHeaderSection(recallTransactionEmailType) +
    emailBodySection(recallTransactionEmailType, recallEmailToAgencyContentProps.formSgRecallIssuanceErrorScenariosDocUrl) +
    emailFooterSection(recallEmailToAgencyContentProps)
  );
};

export const generateRecallEmailToAgencyEmailMjmlTemplate = (
  {
    baseUrl,
    imageAssetsUrl,
    currentDate = new Date(),
    transactionUuid,
    timeOfRecallRequest,
    agencyName,
    agencyCode,
    requestorEmail,
    formSgRecallIssuanceErrorScenariosDocUrl,
  }: RecallEmailToAgencyProps,
  recallTransactionEmailType: RECALL_TRANSACTION_EMAIL_TYPE,
) => {
  return fileSgEmailTemplate(
    { baseUrl, imageAssetsUrl, currentDate },
    generateRecallEmailTemplate(
      {
        transactionUuid,
        timeOfRecallRequest,
        agencyName,
        agencyCode,
        requestorEmail,
        formSgRecallIssuanceErrorScenariosDocUrl,
      },
      recallTransactionEmailType,
    ),
  );
};
