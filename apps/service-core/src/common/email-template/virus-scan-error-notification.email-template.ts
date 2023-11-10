import { fileSgEmailTemplate, FsgEmailProps } from './mjml-helper';

type VirusOrScanErrorNotificationEmailContent = {
  subject: string;
  recipient: string;
  affectedFiles: string[];
  transactionId: string;
  externalRefId: string | null;
};

type VirusOrScanErrorNotificationEmailProps = VirusOrScanErrorNotificationEmailContent & FsgEmailProps;

/**
 * Note:
 * Padding in mj-text and css ctyling of text html tags are not supported in Windows Outlook,
 * hence mj-section/mj-column are used as padding in table is supported
 **/
const virusOrScanErrorNotificationContent = ({
  subject,
  recipient,
  affectedFiles,
  transactionId,
  externalRefId,
}: VirusOrScanErrorNotificationEmailContent) => `
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
        <p><strong>To ${recipient},</strong></p>
      </mj-text>
    </mj-column>
  </mj-section>

  <mj-section>
    <mj-column mj-class='content-col' padding-bottom='24px'>
      <mj-text>
        <p>
          FileSG was unable to upload your file(s) as it has failed the virus scanning. <br><br>
          You may wish to check the file integrity before uploading it again. <br><br>
          We have listed the name of the affected file(s) below for your reference.
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
      <!-- FILE NAME -->
      <mj-text mj-class='field-label'>
        <h3>File Name</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'>${affectedFiles
          .map((file) => {
            return file;
          })
          .join('<br>')}</p>
      </mj-text>


      <!-- AGENCY REF NO. -->
      <mj-spacer height='12px' />

      <mj-text mj-class='field-label'>
        <h3>Agency Reference No.</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'>${externalRefId ?? '-'}</p>
      </mj-text>

      <mj-spacer height='12px' />

      <mj-text mj-class='field-label'>
        <h3>Transaction UUID</h3>
      </mj-text>
      <mj-text>
        <p class='bold-semi'>${transactionId}</p>
      </mj-text>
    </mj-column>
  </mj-section>
`;

export const virusOrScanErrorNotificationMjmlTemplate = ({
  subject,
  recipient,
  affectedFiles,
  transactionId,
  externalRefId,
  baseUrl,
  imageAssetsUrl,
  currentDate = new Date(),
}: VirusOrScanErrorNotificationEmailProps) => {
  return fileSgEmailTemplate(
    { baseUrl, imageAssetsUrl, currentDate },
    virusOrScanErrorNotificationContent({
      subject,
      recipient,
      affectedFiles,
      transactionId,
      externalRefId,
    }),
  );
};
