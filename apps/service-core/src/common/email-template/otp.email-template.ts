import { format } from 'date-fns';
import mjml2html from 'mjml';

import { fileSgEmailTemplate, FsgEmailProps } from './mjml-helper';

export function OtpTemplate(inputOtp: string, expireAt: Date, baseUrl: string, recipientName?: string | null) {
  const currentDate = new Date();
  const imageAssetsUrl = `${baseUrl}/assets/images/icons`;
  const otpTemplate = otpEmailTemplate({
    baseUrl,
    inputOtp,
    expireAt,
    recipientName,
    imageAssetsUrl,
    currentDate,
  });

  return mjml2html(otpTemplate, {}).html;
}

type OtpEmailContent = {
  inputOtp: string;
  expireAt: Date;
  recipientName?: string | null;
};
type OtpEmail = OtpEmailContent & FsgEmailProps;

const otpEmailContent = ({ inputOtp, expireAt, recipientName }: OtpEmailContent) => `
<mj-section>
  <mj-column mj-class='content-col'>
    <mj-text mj-class='primary-color'>
      <h1 class='bold-full'>Verify your email address</h1>
    </mj-text>

    <mj-spacer height='16px' />

    <mj-text>
      <p><strong>Hi${recipientName ? ` ${recipientName}` : ''},</strong></p>
    </mj-text>

    <mj-spacer height='16px' />

    <mj-text>
      <p>Please enter the following 6-digit one-time password (OTP) to verify your email address: </p>
    </mj-text>

    <mj-spacer height='8px' />

    <mj-text>
      <h1 class='bold-full'>${inputOtp}</p>
    </mj-text>

    <mj-spacer height='8px' />

    <mj-text >
      <p>This OTP will expire at ${format(expireAt, 'h:mm a')} SG Time. Please do not share this OTP with anyone.</p>
    </mj-text>

    <mj-spacer height='8px' />

    <mj-text >
      <p>Please ignore this message if you did not make this request.</p>
    </mj-text>

    <mj-spacer height='16px' />
  </mj-column>
</mj-section>`;

export const otpEmailTemplate = ({ baseUrl, imageAssetsUrl, currentDate, inputOtp, expireAt, recipientName }: OtpEmail) =>
  fileSgEmailTemplate({ baseUrl, imageAssetsUrl, currentDate }, otpEmailContent({ inputOtp, expireAt, recipientName }));
