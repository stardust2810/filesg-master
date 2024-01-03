import { TextLink, Typography } from '@filesg/design-system';

import androidSavePdfImage from '../../../../assets/images/faq/faq-android-save-pdf.png';
import iosSavePdfImage from '../../../../assets/images/faq/faq-ios-save-pdf.png';
import { ExternalLink, WebPage } from '../../../../consts';
import { StyledFaqImg } from './style';

type FaqCategory = 'ABOUT_FILESG' | 'RETRIEVING_YOUR_DOCUMENTS' | 'FILE_TYPE_AND_FORMAT' | 'DIGITAL_PASSES';

export enum FAQ_CONTENT_TYPE {
  CONTENT_ONLY = 'content-only',
  CONTENT_WITH_TITLE = 'content-with-title',
  FORMATTED_CONTENT_WITH_TITLE = 'formatted-content-with-title',
  FORMATTED_CONTENT_WITH_NUMBERING_TITLE = 'formatted-content-with-numbering-title',
  ACCORDION_GROUP = 'accordion-group',
}

type AnswerTitle = string | JSX.Element;
export type AnswerContent = string | JSX.Element | (string | JSX.Element)[];
export type FormattedAnswerContent = (string | JSX.Element)[];
export type NumberingTitleFormattedAnswerContent = { title: AnswerTitle; content: (string | JSX.Element)[] }[];
export type ContentFormat = 'ORDERED' | 'UNORDERED';

type AnswerContentType = AnswerContent | FormattedAnswerContent | NumberingTitleFormattedAnswerContent | FaqItemAnswerContent[];

interface BaseContent {
  type: FAQ_CONTENT_TYPE;
  content: AnswerContentType | FaqAccordionDetails[];
  title?: AnswerTitle | never;
  toBoldTitle?: boolean | never;
  isNumberingTitle?: true | never;
  contentFormat?: ContentFormat | never;
}

export interface ContentOnly extends BaseContent {
  type: FAQ_CONTENT_TYPE.CONTENT_ONLY;
  title?: never;
  isNumberingTitle?: never;
  toBoldTitle?: never;
  content: AnswerContent;
  contentFormat?: ContentFormat;
}

export interface TitleWithContent extends BaseContent {
  type: FAQ_CONTENT_TYPE.CONTENT_WITH_TITLE;
  title: AnswerTitle;
  toBoldTitle?: boolean;
  isNumberingTitle?: never;
  content: AnswerContent;
  contentFormat?: never;
}

export interface TitleWithFormattedContent extends BaseContent {
  type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE;
  title: AnswerTitle;
  toBoldTitle?: boolean;
  isNumberingTitle?: never;
  content: FormattedAnswerContent;
  contentFormat: ContentFormat;
}

export interface NumberingTitleWithFormattedContent extends BaseContent {
  type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_NUMBERING_TITLE;
  title?: never;
  toBoldTitle?: boolean;
  isNumberingTitle: true;
  content: NumberingTitleFormattedAnswerContent;
  contentFormat: ContentFormat;
}

export interface AccordionGroupContent extends BaseContent {
  type: FAQ_CONTENT_TYPE.ACCORDION_GROUP;
  content: FaqAccordionDetails[];
  contentFormat?: never;
  title?: never;
  toBoldTitle?: never;
  isNumberingTitle?: never;
}

export type FaqItemAnswerContent =
  | ContentOnly
  | TitleWithContent
  | TitleWithFormattedContent
  | NumberingTitleWithFormattedContent
  | AccordionGroupContent;

export interface FaqAccordionDetails {
  id: string;
  title: string;
  content: FaqItemAnswerContent[];
}

export interface FaqItem extends FaqAccordionDetails {
  isTopCitizenFaq?: boolean; // true indicates that faq is for public citizen page
  isTopAgencyFaq?: boolean; // true indicates that faq is for public agency page
  category?: FaqCategory;
}

export interface FaqPageContent {
  title: string;
  to: WebPage;
  items: FaqItem[];
}

export type Faq = {
  [key in FaqCategory]: FaqPageContent;
};

export const FAQ_MASTER_OBJECT: Faq = {
  ABOUT_FILESG: {
    title: 'About FileSG',
    to: WebPage.ABOUT_FILESG,
    items: [
      {
        id: 'what-is-filesg',
        title: 'What is FileSG?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content:
              'FileSG is a secure digital document management platform, developed by GovTech, that allows members of the public to easily access and download documents issued by the government.',
          },
          {
            type: FAQ_CONTENT_TYPE.CONTENT_WITH_TITLE,
            title: 'For Individuals',
            toBoldTitle: true,
            content: [
              'Members of public can receive documents issued by different government agencies directly in their personal FileSG accounts.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.CONTENT_WITH_TITLE,
            title: 'For Government Agencies',
            toBoldTitle: true,
            content: [
              'Government agencies can distribute documents to members of the public via FileSG without having to develop their own file management systems.',
            ],
          },
        ],
        isTopCitizenFaq: true,
      },
      {
        id: 'filesg-signup',
        title: 'Do I need a Singpass account to use FileSG?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: 'You may use FileSG with or without a Singpass account.',
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>with</u> a Singpass account:
              </>
            ),
            content: [
              'Log in to your FileSG account with Singpass.',
              <Typography variant="PARAGRAPH">
                If you experience issues logging in with your Singpass password, it could be due to the ongoing Singpass System Upgrade and
                you are required to reset your password at{' '}
                <TextLink endIcon="sgds-icon-external" newTab={true} font="PARAGRAPH" type="ANCHOR" to={ExternalLink.SINGPASS}>
                  {ExternalLink.SINGPASS}
                </TextLink>
                {'. '}
                Alternatively, you may scan the QR code using your Singpass app to log in.
              </Typography>,
              'When you log in for the first time, you will be asked to confirm your contact details so that FileSG can notify you of any updates on your documents or account.',
              'Upon successful login, you can view and download documents you have been issued by different government agencies through FileSG.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>without</u> a Singpass account:
              </>
            ),
            content: [
              'You will need to enter the Transaction ID for the document(s) you are trying to retrieve.',
              'You will be asked to verify your identity via Two-Factor Authentication (2FA).',
              'Upon successful verification, you can view and download documents issued to you by the specific government agency.',
              <Typography variant="PARAGRAPH">
                View{' '}
                <TextLink font="PARAGRAPH" to={`${WebPage.FAQ}${WebPage.RETRIEVING_YOUR_DOCUMENTS}`} type="LINK">
                  FAQ - Retrieving your documents
                </TextLink>{' '}
                for more details.
              </Typography>,
            ],
          },
        ],
        isTopCitizenFaq: true,
      },
      {
        id: 'unauthorised-access',
        title: 'Will unauthorised persons have access to my digital documents?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content:
              'Singpass authentication or 2FA is always required to access your documents on FileSG. Individuals should ensure that their documents are shared only with trusted individuals/organisations (e.g. Government agencies) for verification purposes.',
          },
        ],
      },
    ],
  },
  RETRIEVING_YOUR_DOCUMENTS: {
    title: 'Retrieving your documents',
    to: WebPage.RETRIEVING_YOUR_DOCUMENTS,
    items: [
      {
        id: 'document-retrieval',
        title: 'How do I retrieve documents government agencies issued me through FileSG?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>with</u> a Singpass account:
              </>
            ),
            content: [
              'Log in to your FileSG account with Singpass.',
              'Upon successful login, you will be able to find your latest file activities under the "All Activities" page, and your issued files under the "My Files" page.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>without</u> a Singpass account:
              </>
            ),
            content: [
              'Register for a Singpass account for easier access to view and download documents issued by various government agencies.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content:
              'If you are ineligible to register or unable to use Singpass, you may view and download the documents issued to you by government agencies by following these steps:',
          },
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            contentFormat: 'ORDERED',
            content: [
              <Typography variant="PARAGRAPH">
                Go to FileSG's{' '}
                <TextLink font="PARAGRAPH" to={`${WebPage.RETRIEVE}`} type="LINK" newTab>
                  Retrieve Your Documents
                </TextLink>{' '}
                page or via your file issuance email.
              </Typography>,
              'Enter the "Transaction ID" which can be found in the email and select "Submit".',
              'Select "Retrieve without Singpass".',
              'Enter your personal particulars and select "Verify".',
              'If your particulars entered are accurate, you will receive a One-Time Password (OTP) SMS via the mobile number you provided to the issuing government agency or from government records.',
              'Enter the OTP. If it is valid, you will be directed to view and download the documents.',
            ],
          },
        ],
        isTopCitizenFaq: true,
      },
      {
        id: 'retrieve-documents-on-behalf',
        title: 'How do I retrieve documents on behalf of the document recipient?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'Only document recipients themselves can view their documents via Singpass login.',
              "The document recipient's name is stated in the issuance email under 'Recipient Name'.",
              'If you are retrieving a document on behalf of the document recipient, you will need to retrieve the document without a Singpass account:',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            contentFormat: 'ORDERED',
            content: [
              <Typography variant="PARAGRAPH">
                Go to FileSG's{' '}
                <TextLink font="PARAGRAPH" to={`${WebPage.RETRIEVE}`} type="LINK" newTab>
                  Retrieve Your Documents
                </TextLink>{' '}
                page or via the file issuance email.
              </Typography>,
              'Enter the "Transaction ID" which can be found in the email and select "Submit".',
              'Select "Retrieve without Singpass".',
              `Enter the document recipient's personal particulars and select "Verify".`,
              'If the particulars entered are accurate, you will receive a One-Time Password (OTP) SMS via the mobile number provided to the issuing government agency or from government records.',
              'Enter the OTP. If it is valid, you will be directed to view and download the documents.',
            ],
          },
        ],
      },
      {
        id: 'not-receiving-issuance-email',
        title: 'What should I do if I have not received the file issuance email?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'You should receive an email when a document has been issued to you.',
              'The email address and Singapore mobile number (if applicable) you provided the issuing agency must be accurate to receive the issuance email.',
              'If you have not received the file issuance email, please check your spam or junk folder.',
              'If you still cannot locate the file issuance email, please follow these steps:',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>with</u> a Singpass account:
              </>
            ),
            content: [
              'If your document has been successfully issued, you will be able to find it in your FileSG account by logging in with Singpass. If you are unable to find your document in your account, please contact the issuing agency to check if your document has been issued.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>without</u> a Singpass account:
              </>
            ),
            content: ['Please contact the issuing agency to check if your document has been issued.'],
          },
        ],
      },
      {
        id: 'missing-transaction-id',
        title: '(Non-Singpass users) What if I do not have the “Transaction ID” required to retrieve my documents?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'The “Transaction ID” can be found in the file issuance email.',
              '(a) If you have deleted the email, please contact the issuing agency so that they can resend you the email.',
              '(b) If you lost access to the email account which the file issuance email was sent to, please contact the issuing agency to provide your new email address.',
            ],
          },
        ],
      },
      {
        id: 'failed-verification-during-retrieval',
        title: '(Non-Singpass users) What if I am unable to verify my particulars to retrieve my documents?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content:
              'Check that the personal particulars you have entered for verification are accurate and the same as what you provided to the issuing agency. If you have reached the limit for verification attempts, please contact the government agency that issued the document for further assistance.',
          },
        ],
      },
      {
        id: 'missing-otp-during-verification',
        title: '(Non-Singpass users) What should I do if I did not receive the OTP to verify my particulars?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content:
              'Check that the partially masked mobile number displayed that the OTP has been sent to belongs to you. If you no longer have access to the mobile number, please contact the government agency issuing the document to provide your new Singapore mobile number.',
          },
        ],
      },
    ],
  },
  FILE_TYPE_AND_FORMAT: {
    title: 'File type and format',
    to: WebPage.FILE_TYPE_AND_FORMAT,
    items: [
      {
        id: 'what-is-oa',
        title: 'What is the OpenAttestation (OA) file format?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'FileSG works with government agencies to issue documents that require verification in the OpenAttestation (OA) file format.',
              'OA is an open-sourced framework to endorse and verify documents.',
              'Documents issued this way are cryptographically trustworthy and can be verified independently without having to query a central database. OA files are not meant to be readable but to be shared with the authorities if requested.',
            ],
          },
        ],
        isTopAgencyFaq: true,
      },
      {
        id: 'verify-oa',
        title: 'How can I verify an Open Attestation (OA) file?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: (
              <Typography variant="PARAGRAPH">
                There are two ways to verify an OpenAttestation (OA) file. Visit FileSG's{' '}
                <TextLink font="PARAGRAPH" to={`${WebPage.VERIFY}`} type="LINK" newTab>
                  Verify Documents
                </TextLink>{' '}
                page to get started.
              </Typography>
            ),
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_NUMBERING_TITLE,
            isNumberingTitle: true,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            content: [
              {
                title: 'Scan QR code',
                content: [
                  'On the "Verify Documents" page, select the "Scan QR code" option, and select "Click to scan".',
                  'You will be asked to give permission to access your device camera. Click "Approve" to proceed.',
                  'Scan the QR code found on the document under the "For Verification Use" section. Only QR codes found on documents issued by FileSG can be verified in this manner.',
                  'If you have scanned a valid QR code, you will be directed to the "Verification Results" page.',
                  'On the "Verification Results" page, if the document is valid, you will be able to see a preview of the document.',
                ],
              },
              {
                title: 'Upload OA File',
                content: [
                  'On the "Verify Documents" page, select the "Upload OA file" option, and drag over or select the OA file from your device.',
                  'If you have selected a valid OA file, you will be directed to the "Verification Results" page.',
                  'On the "Verification Results" page, if the document is valid, you will be able to see a preview of the document.',
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'save-pdf-oa',
        title: 'How can I save a PDF version of my OpenAttestation (OA) file?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: 'A preview of your OA file is rendered in the document page. To save a PDF copy for easy reference:',
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: 'On Desktop',
            content: [
              'Select the document from “My Files” page or the issuance activity page.',
              'On the document page, select “Print or Save as PDF” under the “More Actions” section.',
              "Your web browser's Print menu will open.",
              'Select the option to “Save as PDF” to save to your computer.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: 'On Mobile',
            content: [
              'Select the document from “My Files” page or the issuance activity page.',
              'On the document page, select “Print or Save as PDF" under the “More Actions” tab.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.ACCORDION_GROUP,
            content: [
              {
                id: 'save-pdf-android',
                title: 'On Android Devices',
                content: [
                  {
                    type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
                    contentFormat: 'UNORDERED',
                    content: [
                      'The Android Print menu will open. Select “Save as PDF” in the dropdown list.',
                      'Select the “Download PDF” button to save to your device.',
                    ],
                  },
                  {
                    type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
                    content: <StyledFaqImg src={androidSavePdfImage} width={3024} height={1688} alt="Save as PDF for Android devices" />,
                  },
                ],
              },
              {
                id: 'save-pdf-ios',
                title: 'On iOS Devices',
                content: [
                  {
                    type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
                    contentFormat: 'UNORDERED',
                    content: [
                      'The iOS Print menu will open. Select the “Share” icon or “Print”.',
                      'Select “Save to Files” to save to your device.',
                    ],
                  },
                  {
                    type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
                    content: <StyledFaqImg src={iosSavePdfImage} width={3024} height={1688} alt="Save as PDF for Android devices" />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  DIGITAL_PASSES: {
    title: 'Digital LTVP/STP/DP [ICA]',
    to: WebPage.DIGITAL_PASSES,
    items: [
      {
        id: 'what-is-digital-pass',
        title: 'What is the digital LTVP/STP/DP?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'From 27 February 2023, the Immigration & Checkpoints Authority (ICA) will cease issuing physical Long-Term Pass (LTP) cards. Only digital LTPs will be issued. This will apply to the ICA-issued Long-Term Visit Pass and Student’s Pass, and Dependant’s Pass granted by the Ministry of Social and Family Development.',
              "All LTVP, STP and DP holders can access their digital passes in their personal FileSG accounts. The digital passes are downloadable in two file formats: Portable Document Format (PDF) and OpenAttestation (OA). For those below the age of 15, their sponsors who have a Singpass account will also be issued a copy of the LTP holder's digital pass, and can access it via FileSG.",
            ],
          },
        ],
      },
      {
        id: 'acceptance-of-digital-pass',
        title: 'Will the digital LTVP/STP/DP be recognised and accepted everywhere?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'The digital LTVP/STP/DP is equivalent to the physical cards that were issued for these passes, before 27 February 2023.',
              'The digital LTVP/STP/DP is issued in the OA file format and can therefore be verified by authorities when necessary.',
            ],
          },
        ],
      },
      {
        id: 'view-and-download-digital-pass',
        title: 'How can I view and download my digital LTVP/STP/DP?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For passholders <u>with</u> a Singpass account:
              </>
            ),
            content: [
              'Log in to your FileSG account with Singpass.',
              'Go to the “My Files” page.',
              'Select and open the issued digital LTVP/STP/DP.',
              'You can choose "Print or save as PDF" if you require a viewable copy or "Download as OA" if you require the document in the .oa file format.',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For passholders <u>without</u> a Singpass account:
              </>
            ),
            content: [
              <Typography variant="PARAGRAPH">
                Go to FileSG's{' '}
                <TextLink font="PARAGRAPH" to={`${WebPage.RETRIEVE}`} type="LINK" newTab>
                  Retrieve Your Documents
                </TextLink>{' '}
                page.
              </Typography>,
              'You should have received an email upon successful issuance of the digital LTVP/STP/DP.',
              'Enter the "Transaction ID" which can be found in the email and select "Submit".',
              'Select "Retrieve without Singpass".',
              'Enter your personal particulars and select "Verify". You can find your FIN on the In-Principal Approval (IPA) letter issued to you by ICA.',
              'If your particulars entered are accurate, you will receive a One-Time Password (OTP) SMS via the mobile number you provided to the issuing government agency or from government records.',
              'Enter the OTP. If it is valid, you will be directed to view the activity page.',
              'Select and open the issued digital LTVP/STP/DP.',
              'You can choose "Print or Save as PDF" if you require a viewable copy or "Download as OA" if you require the document in the .oa file format.',
            ],
          },
        ],
      },
      {
        id: 'ltvp-not-receiving-issuance-email',
        title: 'What should I do if I have not received the file issuance email?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'You should receive an email when a digital LTVP/STP/DP document has been issued to you.',
              'The email address and Singapore mobile number you provided ICA during application and Completion of Formalities (COF) must be accurate to receive the issuance email.',
              'If you have not received the file issuance email, please check your spam or junk folder.',
              'If you still cannot locate the file issuance email, please follow these steps:',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>with</u> a Singpass account:
              </>
            ),
            content: [
              <Typography variant="PARAGRAPH">
                If your document has been successfully issued, you will be able to find it in your FileSG account by logging in with
                Singpass. If you are unable to find your document in your account, please email{' '}
                <TextLink font="PARAGRAPH" to="mailto:ICA_Visit_Pass@ica.gov.sg" type="ANCHOR">
                  ICA_Visit_Pass@ica.gov.sg
                </TextLink>{' '}
                or{' '}
                <TextLink font="PARAGRAPH" to="mailto:ICA_STP1@ica.gov.sg" type="ANCHOR">
                  ICA_STP1@ica.gov.sg
                </TextLink>{' '}
                (for STP) to check if your document has been issued.
              </Typography>,
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            title: (
              <>
                For users <u>without</u> a Singpass account:
              </>
            ),
            content: [
              <Typography variant="PARAGRAPH">
                Please email{' '}
                <TextLink font="PARAGRAPH" to="mailto:ICA_Visit_Pass@ica.gov.sg" type="ANCHOR">
                  ICA_Visit_Pass@ica.gov.sg
                </TextLink>{' '}
                or{' '}
                <TextLink font="PARAGRAPH" to="mailto:ICA_STP1@ica.gov.sg" type="ANCHOR">
                  ICA_STP1@ica.gov.sg
                </TextLink>{' '}
                (for STP) to check if your document has been issued.
              </Typography>,
            ],
          },
        ],
      },
      {
        id: 'can-others-verify-my-digital-pass',
        title: 'How can someone verify my digital LTVP/STP/DP?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: (
              <Typography variant="PARAGRAPH">
                The digital LTVP/STP/DP issued in OA file format can be verified. Authorities who need to verify your pass can do so via two
                ways on FileSG's{' '}
                <TextLink font="PARAGRAPH" to={`${WebPage.VERIFY}`} type="LINK" newTab>
                  Verify Documents
                </TextLink>{' '}
                page.
              </Typography>
            ),
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_NUMBERING_TITLE,
            isNumberingTitle: true,
            contentFormat: 'UNORDERED',
            toBoldTitle: true,
            content: [
              {
                title: 'Scan QR code',
                content: [
                  'On the "Verify Documents" page, select the "Scan QR code" option, and select "Click to scan".',
                  'You will be asked to give permission to access your device camera. Click "Approve" to proceed.',
                  'Scan the QR code found on the document under the "For Verification Use" section. Only QR codes found on documents issued by FileSG can be verified in this manner.',
                  'If you have scanned a valid QR code, you will be directed to the "Verification Results" page.',
                  'On the "Verification Results" page, if the document is valid, you will be able to see a preview of the document.',
                ],
              },
              {
                title: 'Upload OA File',
                content: [
                  'On the "Verify Documents" page, select the "Upload OA file" option, and drag over or select the OA file from your device.',
                  'If you have selected a valid OA file, you will be directed to the "Verification Results" page.',
                  'On the "Verification Results" page, if the document is valid, you will be able to see a preview of the document.',
                ],
              },
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            title: 'What will be shown to the verifier?',
            toBoldTitle: true,
            content: [
              'The “Scan QR code” verification option will allow the verifier to see only selected pass details necessary for verification.',
              'The "Upload OA file" verification option will allow the verifier to see all the pass details. As such, please ensure that you only share your OA file when necessary.',
            ],
          },
        ],
      },
      {
        id: 'unauthorised-access-to-digital-pass-data',
        title: 'Will unauthorised persons have access to my digital pass data?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'Singpass authentication or 2FA is always required to access your documents on FileSG.',
              'Recipients can only access documents that have been specifically issued to them by government agencies. Digital documents are meant to serve as replacement for physical documents, and it is the onus of users to exercise vigilance and safeguard their personal information by only sharing these documents with trusted individuals/organisations (e.g. Government agencies) for verification purposes.',
            ],
          },
        ],
      },
      {
        id: 'ltvp-statuses',
        title: 'Why do I see a "Cancelled" or "Expired" status on my digital LTVP/STP/DP?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'The status of "Cancelled" or "Expired" reflects the validity of the pass at the current date.',
              'Passes that have the "Cancelled" status have been cancelled by ICA due to certain reasons and are no longer valid for use.',
              'Passes that have the "Expired" status have passed their expiry date and are no longer valid for use.',
              'Please contact ICA directly should you require any clarification on the cancellation or expiration of your pass.',
            ],
          },
        ],
      },
      {
        id: 'particulars-renewal-new-pass-issuance',
        title:
          'When I renew my digital LTVP/STP/DP or update my residential address, my current pass is cancelled and I am issued with a new pass. Why is this so?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'Whenever there is a change in the information (e.g. residential address, pass issue date or pass expiry date) displayed on your digital LTP, the current pass which is no longer accurate has to be cancelled. A new pass will be issued with the updated information.',
              'This is necessary as the digital LTP is issued in the OpenAttestation (OA) file format, which allows verification by authorities and third parties. As such, there is a need to ensure that  only one true copy of your digital pass which reflects your latest updated information, exists at any point in time.',
            ],
          },
        ],
      },
      {
        id: 'nonsp-contacts',
        title:
          '(Non-Singpass users) What should I do if I have changed my mobile number, or did not receive the OTP to verify my particulars?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              'Check that the partially masked mobile number displayed which the OTP has been sent to belongs to you.',
              <Typography variant="PARAGRAPH">
                If you have not changed your mobile number,{' '}
                <TextLink font="PARAGRAPH" to={ExternalLink.CONTACT_US} type="ANCHOR" endIcon="sgds-icon-external" newTab={true}>
                  contact us
                </TextLink>
                .
              </Typography>,
              <Typography variant="PARAGRAPH">
                If you have changed your mobile number and no longer have access to the old mobile number you provided during application,
                please email{' '}
                <TextLink font="PARAGRAPH" to="mailto:ICA_Visit_Pass@ica.gov.sg" type="ANCHOR">
                  ICA_Visit_Pass@ica.gov.sg
                </TextLink>{' '}
                to update your Singapore mobile number and provide your Application ID which can be found in the In-Principal Approval (IPA)
                letter.
              </Typography>,
            ],
          },
        ],
      },
      {
        id: 'how-to-contact-ica-regarding-digital-pass',
        title: 'How can I contact ICA for assistance on digital LTVP/STP/DP-related enquiries?',
        content: [
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: [
              <Typography variant="PARAGRAPH">
                For LTVP queries, you may email to{' '}
                <TextLink font="PARAGRAPH" to="mailto:ICA_Visit_Pass@ica.gov.sg" type="ANCHOR">
                  ICA_Visit_Pass@ica.gov.sg
                </TextLink>
              </Typography>,
              'For STP queries, you may email to',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            title: (
              <>
                <TextLink font="PARAGRAPH" to="mailto:ICA_STP1@ica.gov.sg" type="ANCHOR">
                  ICA_STP1@ica.gov.sg
                </TextLink>{' '}
                for pass holders from:
              </>
            ),
            content: [
              'Institutes of Higher Learning (IHL)',
              'Foreign System Schools (FSS)',
              'Institues of Technical Education (ITE)',
              'Government/Government-Aided/Independent Schools (GOV)',
            ],
          },
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: 'or',
          },
          {
            type: FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE,
            contentFormat: 'UNORDERED',
            title: (
              <>
                <TextLink font="PARAGRAPH" to="mailto:ICA_STP2@ica.gov.sg" type="ANCHOR">
                  ICA_STP2@ica.gov.sg
                </TextLink>{' '}
                for pass holders from:
              </>
            ),
            content: ['Approved Private Education Institutions (PTE)', 'Kindergartens and Childcare Centres (KID)'],
          },
          {
            type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
            content: (
              <Typography variant="PARAGRAPH">
                For DP queries, you may email to{' '}
                <TextLink font="PARAGRAPH" to="mailto:msw_cw_dp@msf.gov.sg" type="ANCHOR">
                  msw_cw_dp@msf.gov.sg
                </TextLink>
              </Typography>
            ),
          },
        ],
      },
    ],
  },
};
