import { format } from 'date-fns';

const mjmlHeader = `
      <mj-breakpoint width="600px" />
      <mj-font name="Noto sans" href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap" />
      <mj-style inline="inline">

        h1 {
        font-size: 18px;
        line-height: 26px;
        font-weight: 700;
        margin: 0;
        }

        h2 {
        font-size: 16px;
        line-height: 24px;
        font-weight: 500;
        margin: 0;
        }

        h3 {
        font-size: 13px;
        line-height: 18px;
        font-weight: 400;
        margin: 0;
        }

        p {
        font-size: 15px;
        line-height: 22px;
        font-weight: 400;
        margin: 0;
        }

        small {
        font-size: 14px;
        line-height: 20px;
        font-weight: 400;
        margin: 0;
        }

        .copyright {
          font-size: 12px;
          line-height: 16px;
          font-weight: 400;
          margin: 0;
        }

        strong {
          font-weight: 500;
        }

        ul {
          list-style-type: disc;
          list-style-position: inside;
          margin: 0;
          padding: 0px;
        }

        li {
          font-size: 15px;
          line-height: 22px;
          font-weight: 400;
          margin: 0;
        }

        .bold-full{
          font-weight: 700 !important;
        }

        .bold-semi{
          font-weight: 600 !important;
        }

        .bold-medium{
          font-weight: 500 !important;
        }

        .bold-normal{
          font-weight: 400 !important;
        }

        .wrapper > table {
          max-width: 700px;
        }

        .email-wrapper {
          padding-top:24px;
          padding-bottom:32px;
          padding-left:16px;
          padding-right:16px;
        }

        .content-wrapper {
          max-width: 700px;
        }

        .content-container{
          background-color:#FFFFFF;

          border: 1px solid #C6C6C6;
          border-radius: 8px;
        }

        .email-ul {
          margin:0;
          padding: 0;
        }

        .password-wrapper {
          border-radius: 8px;
        }

        .password-highlight{
          border-left: 4px solid #372CD1;
          background-color: #FFFFFF;
          padding: 4px 8px;
        }

        .access-until-wrapper {
          border-radius: 8px;
        }

        .access-until-highlight{
          border-left: 4px solid #008196;
          background-color: #FFFFFF;
          padding: 4px 8px;
        }
      </mj-style>
      <mj-attributes>
        <mj-all font-family="'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight='400' color='#323232' />
        <mj-section padding='0 16px' />
        <mj-column padding='0px' />
        <mj-class name='content-col' width='70%' />
        <mj-class name='field-label' color='#6B6B6B' />
        <mj-class name='primary-color' color='#271F92' />
        <mj-text padding='0' />
        <mj-image padding='0' />
        <mj-button inner-padding='12px 24px' width='256px' border-radius='8px' font-size='16px' line-height="24px" padding='0' />
      </mj-attributes>
`;

const fileSGFooter = (imageAssetsURL: string, baseUrl: string, currentDate: Date) => `
<!-- Start of Footer -->

<mj-wrapper full-width='full-width'>
  <mj-section full-width="full-width" css-class='content-wrapper'>
    <mj-column padding='0' vertical-align='middle' width='75%' padding-bottom='24px' >
      <mj-text>
        <h2 class='bold-semi'>What is FileSG?</h2>
      </mj-text>
      <mj-spacer height='8px' />
      <mj-text >
        <small>
          FileSG is a secure digital document management platform that allows members of the public to easily access and download documents issued by the government. <br><br> Learn more at <a href="${baseUrl}" target='_blank'>${baseUrl}</a>.
        </small>
      </mj-text>
    </mj-column>

    <mj-column vertical-align='middle' padding='0' width='25%' padding-bottom='24px'>
      <mj-image align='left' src='${imageAssetsURL}/miscellaneous/filesg.png' alt="FileSG logo footer" width='128px' css-class='' />
    </mj-column>
  </mj-section>
  <mj-section full-width="full-width" css-class='content-wrapper'>

  <mj-group  width="100%">
    <mj-column>
      <mj-text color='#6B6B6B'>
        <small class='copyright'>Copyright © ${format(
          currentDate,
          'yyyy',
        )} FileSG. Developed by the Government Technology Agency (GovTech) Singapore.</small>
      </mj-text>
      <mj-spacer height="24px" />
    </mj-column>
  </mj-group>

  </mj-section>
</mj-wrapper>

<!-- End of Footer -->
`;

export type FsgEmailProps = {
  agencyCode?: string;
  agencyFullName?: string;
  agencyIcon?: string;
  baseUrl: string;
  imageAssetsUrl: string;
  currentDate: Date;
};

export const fileSgEmailTemplate = (
  { agencyCode, agencyFullName, agencyIcon, baseUrl, currentDate, imageAssetsUrl }: FsgEmailProps,
  content: string,
) => `
  <mjml>
    <mj-head>
    ${mjmlHeader}
    </mj-head>

    <mj-body css-class="email-wrapper" background-color="#F7F7F7">
      <mj-wrapper css-class="wrapper content-wrapper content-container" padding='32px 0' background-color="#FFFFFF" border-radius="8px">

        <!-- Start of Agency Logo & Title -->

        <mj-section>
          <mj-column mj-class='content-col'>
            <mj-image src='${agencyIcon ?? `${imageAssetsUrl}/miscellaneous/filesg.png`}'
                alt='${agencyIcon ? `Agency logo` : `FileSG Logo`}' align='left' width='130px' />
          </mj-column>
        </mj-section>

        ${
          agencyFullName
            ? `
          <mj-section>
            <mj-column mj-class='content-col' padding-top='16px'>
              <mj-text>
                <h2 class='bold-semi'>${agencyFullName} ${agencyCode && `(${agencyCode.toUpperCase()})`}</h2>
              </mj-text>
            </mj-column>
          </mj-section>`
            : ''
        }
        <mj-section>
          <mj-column mj-class='content-col'>
            <mj-divider border-color="#C6C6C6" border-width='1px' width='100%' padding='0' padding-bottom='24px' padding-top='24px' />
          </mj-column>
        </mj-section>
        <!-- End of Agency Logo & Title -->

        <!-- Start of email content -->
        ${content}
        <!-- End of email content -->
        </mj-wrapper>

        ${fileSGFooter(imageAssetsUrl, baseUrl, currentDate)}
      </mj-body>
  </mjml>`;
