import { pluralise, URL_REGEX } from '@filesg/common';
import { format } from 'date-fns';

import { FileAsset } from '../../../entities/file-asset';
import { EMAIL_TYPES } from '../../../utils/email-template';
import { fileSgEmailTemplate, FsgEmailProps } from '../mjml-helper';

type ActivityTemplateContentProps = {
  transactionName: string;
  recipientName: string;
  externalRefId?: string;
  activityId: string;
  customMessage?: string[];
  retrievalPageUrl: string;
  fileList: FileAsset[];
  imageAssetsUrl: string;
  highlightedMessage?: string;
  password?: string;
};

const ICA_AGENCY_CODE = 'ICA';
const ICA_HIGHLIGHTED_MESSAGE = 'Singpass holders can also view your pass in the Singpass mobile app or access it via MyICA portal.';

const getVerbFromEmailType = (emailType: EMAIL_TYPES.ISSUANCE | EMAIL_TYPES.CANCELLATION | EMAIL_TYPES.DELETION) => {
  switch (emailType) {
    case EMAIL_TYPES.ISSUANCE:
      return 'issued';
    case EMAIL_TYPES.CANCELLATION:
      return 'cancelled';
    case EMAIL_TYPES.DELETION:
      return 'deleted';
  }
};

function renderParagraphWithLink(paragraph: string): string {
  return paragraph
    .split(' ')
    .map((word) =>
      URL_REGEX.test(word)
        ? word.endsWith('.')
          ? `<a href="${word.slice(0, -1)}" target='_blank'>${word.slice(0, -1)}</a>.`
          : `<a href="${word}" target='_blank'>${word}</a>`
        : `${word}`,
    )
    .join(' ');
}

function getFirstIndexWithDeleteAt(fileList: FileAsset[]): number {
  return fileList.findIndex((file) => file.deleteAt);
}
const activityTemplateContent = (
  emailType: EMAIL_TYPES.ISSUANCE | EMAIL_TYPES.CANCELLATION | EMAIL_TYPES.DELETION,
  {
    transactionName,
    recipientName,
    externalRefId = undefined,
    activityId,
    customMessage,
    imageAssetsUrl,
    retrievalPageUrl,
    fileList,
    highlightedMessage,
    password,
  }: ActivityTemplateContentProps,
) => {
  const firstFileWithDeleteAtIndex = getFirstIndexWithDeleteAt(fileList);
  const deleteAt = firstFileWithDeleteAtIndex < 0 ? null : fileList[firstFileWithDeleteAtIndex].deleteAt;
  const accessUntil = deleteAt ? new Date(deleteAt) : null;
  accessUntil?.setDate(accessUntil.getDate() - 1);

  return `
    <mj-section>
      <mj-column mj-class='content-col' padding-bottom='24px'>
        <mj-text mj-class='primary-color'>
          <h1 class='bold-semi'>${transactionName}</h1>
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section>
      <mj-column mj-class='content-col' padding-bottom='24px'>

        <!-- RECIPIENT NAME -->
        <mj-text mj-class='field-label'>
          <h3>Recipient Name</h3>
        </mj-text>
        <mj-text>
          <p class='bold-semi'>${recipientName}</p>
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

        <!-- TRANSACTION ID. -->
        <mj-text mj-class='field-label'>
          <h3>Transaction ID</h3>
        </mj-text>
        <mj-text>
          <p class='bold-semi'>${activityId}</p>
        </mj-text>

        <mj-spacer height='24px' />

        ${
          customMessage &&
          `
            <mj-text padding-bottom='12px'>
              <p class='bold-semi'>Agency Message</p>
            </mj-text>
            <mj-text>
            ${customMessage
              .map((para, index) => `<p ${index !== 0 ? "style='margin-top:8px;'" : ''}>${renderParagraphWithLink(para)}</p>`)
              .join('')}
            </mj-text>
          `
        }
      </mj-column>
    </mj-section>

    ${
      highlightedMessage
        ? `
      <!-- Start of Highlighted message -->
      <mj-section>
        <mj-group mj-class='content-col'>
          <mj-column width='20%' vertical-align='top' padding-bottom='24px'>
            <mj-image align='center' src='${imageAssetsUrl}/miscellaneous/bulb.png' alt="lightbulb icon" height='44px' width='44px' />
          </mj-column>
          <mj-column width='80%' vertical-align='middle' padding-bottom='24px'>
            <mj-text >
              <p style='padding-left:12px' class='bold-semi'>${highlightedMessage}</p>
            </mj-text>
          </mj-column>
        </mj-group>
      </mj-section>

      <!-- End of Highlighted message -->
      `
        : ''
    }

    <mj-section>
      <mj-column mj-class='content-col'>
        <mj-divider border-color="#C6C6C6" border-width='1px' width='100%' padding='0' padding-bottom='24px' />
      </mj-column>
    </mj-section>

      <!-- CTA -->
    <mj-section>
      <mj-column css-class='ctaContent' mj-class='content-col'>
        <mj-button padding-bottom="16px" align='left' href='${retrievalPageUrl}' background-color='#372CD1' border='1px solid #372CD1' color='#FFFFFF'>Open in FileSG</mj-button>
      </mj-column>
    </mj-section>

    <!-- Start of filelist -->
    <mj-section>
      <mj-column mj-class='content-col'>
        <mj-text>
          <p class='bold-semi'>${fileList.length} ${pluralise(fileList.length, 'file')} ${getVerbFromEmailType(emailType)}: </p>
        </mj-text>
        <mj-spacer height='8px' />
        <mj-text>
          <ul class='email-ul'>
            ${
              fileList &&
              fileList
                .map(({ name }) => {
                  return `<li>${name}</li>`;
                })
                .join('') // override default comma delimiter for string array
            }
          </ul>
        </mj-text>
        ${(!!accessUntil || password) && `<mj-spacer height='16px' />`}
      </mj-column>
    </mj-section>
    <!-- End of filelist -->

    <!-- Start of limitedAccess message -->
    ${
      emailType === EMAIL_TYPES.ISSUANCE &&
      !!accessUntil &&
      `
      <mj-section>
        <mj-group mj-class='content-col' css-class='access-until-wrapper' background-color="#E6F2F5">
          <mj-column width='20%' vertical-align='top' padding-bottom='24px' padding-top='24px'>
            <mj-image align='center' src='${imageAssetsUrl}/miscellaneous/access-until.png' alt="" height='44px' width='44px' />
          </mj-column>
          <mj-column width='80%' vertical-align='middle'>
            <mj-text padding='12px 16px'  padding-left='0px'>
              <small class='bold-full'>Limited Access</small>
              <h3 style='margin-top:8px;'>All files in this transaction are available until:</h3>
              <h3 class='bold-full access-until-highlight' style='margin-top:8px; width:fit-content;'>${format(
                accessUntil,
                'd MMMM yyyy',
              )}</h3>
              <h3 style='margin-top:8px;'>After which, these files will be deleted and you will no longer be able to access them.</h3>
            </mj-text>
          </mj-column>
        </mj-group>
      </mj-section>
      `
    }

    <!-- End of limitedAccess message -->
    ${
      password &&
      `
    <mj-section>
      <mj-column  mj-class='content-col'><mj-spacer height='8px' /></mj-column>
    </mj-section>
    `
    }

    <!-- Start of password message -->
    ${
      password &&
      `
      <mj-section>
        <mj-group mj-class='content-col' css-class='password-wrapper' background-color='#EBEAFA'>
          <mj-column width='20%' vertical-align='top' padding-bottom='24px' padding-top='24px'>
            <mj-image align='center' src='${imageAssetsUrl}/miscellaneous/encrypted.png' alt="" height='44px' width='44px' />
          </mj-column>
          <mj-column width='80%' vertical-align='middle'>
              <mj-text padding='12px 16px'  padding-left='0px'>
                <small class='bold-full'>Password Protected</small>
                <h3 style='margin-top:8px;'>For enhanced security, all files in this transaction have been encrypted with this randomly generated password:</h3>
                <h3 class='bold-full password-highlight' style='margin-top:8px; width:fit-content;'>${password}</h3>
                <h3 style='margin-top:8px;'>Please do not share the password with anyone.</h3>
              </mj-text>
          </mj-column>
        </mj-group>
      </mj-section>
      `
    }
    <!-- End of password message -->
  `;
};

export type ActivityEmailProps = ActivityTemplateContentProps & FsgEmailProps;

export const activityMjmlTemplate = (
  emailType: EMAIL_TYPES.ISSUANCE | EMAIL_TYPES.CANCELLATION | EMAIL_TYPES.DELETION,
  {
    agencyIcon,
    agencyCode,
    agencyFullName,
    transactionName,
    recipientName,
    externalRefId = undefined,
    activityId,
    customMessage,
    imageAssetsUrl,
    retrievalPageUrl,
    baseUrl,
    fileList,
    currentDate = new Date(),
    password,
  }: ActivityEmailProps,
) => {
  const highlightedMessage =
    emailType === EMAIL_TYPES.ISSUANCE && agencyCode?.toUpperCase() === ICA_AGENCY_CODE ? ICA_HIGHLIGHTED_MESSAGE : undefined;

  return fileSgEmailTemplate(
    { agencyCode, agencyIcon, agencyFullName, baseUrl, imageAssetsUrl, currentDate },
    activityTemplateContent(emailType, {
      transactionName,
      recipientName,
      externalRefId,
      activityId,
      customMessage,
      imageAssetsUrl,
      retrievalPageUrl,
      fileList,
      highlightedMessage,
      password,
    }),
  );
};
