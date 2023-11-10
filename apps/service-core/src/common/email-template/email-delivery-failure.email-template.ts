import { fileSgEmailTemplate, FsgEmailProps } from './mjml-helper';

type TransactionalEmailDeliveryFailureEmailContent = {
  notificationPeriod: string;
  eserviceCode: string;
  subject: string;
  recipientName: string;
};

type TransactionalEmailDeliveryFailureEmailProps = TransactionalEmailDeliveryFailureEmailContent & FsgEmailProps;

const emailDeliveryFailureContent = ({
  subject,
  recipientName,
  notificationPeriod,
  eserviceCode,
}: TransactionalEmailDeliveryFailureEmailContent) => `
  <mj-section>
    <mj-column mj-class='content-col' padding-bottom='16px'>
      <mj-text mj-class='primary-color'>
        <h1 class='bold-full'>${subject}</h1>
      </mj-text>
    </mj-column>
  </mj-section>

  <mj-section>
    <mj-column mj-class='content-col' padding-bottom='8px'>
      <mj-text>
        <p><strong>To ${recipientName},</strong></p>
      </mj-text>
    </mj-column>
  </mj-section>

  <mj-section>
    <mj-column mj-class='content-col' padding-bottom='24px'>
      <mj-text>
      <p>
      FileSG was unable to deliver notifications for the period stated below.<br><br>
      Please refer to attached CSV file for more information.  
      </p>
      </mj-text>
    </mj-column>
  </mj-section>

  <mj-section>
    <mj-column mj-class='content-col'>
      <mj-divider border-color="#C6C6C6" border-width='1px' width='100%' padding='0' padding-bottom='24px' />
    </mj-column>
  </mj-section>

  <mj-section>
    <mj-column mj-class='content-col' >
      <mj-text mj-class='field-label'>
        <h3>Notification Period</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'> ${notificationPeriod}</p>
      </mj-text>
    </mj-column>

    <mj-spacer height='12px' />

    <mj-column mj-class='content-col' >
      <mj-text mj-class='field-label'>
        <h3>System Name</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'> ${eserviceCode}</p>
      </mj-text>
    </mj-column>
  </mj-section>
`;

export const emailDeliveryFailureMjmlTemplate = ({
  subject,
  recipientName,
  baseUrl,
  imageAssetsUrl,
  currentDate = new Date(),
  notificationPeriod,
  eserviceCode,
}: TransactionalEmailDeliveryFailureEmailProps) => {
  return fileSgEmailTemplate(
    { baseUrl, imageAssetsUrl, currentDate },
    emailDeliveryFailureContent({
      subject,
      recipientName,
      notificationPeriod,
      eserviceCode,
    }),
  );
};
