/**
 * @jest-environment jsdom
 */
import mjml2html from 'mjml';

import { mockFileAsset1, mockFileAsset2 } from '../../../modules/features/queue-handler/__mocks__/download-event.service.mock';
import { EMAIL_TYPES } from '../../../utils/email-template';
import { ActivityEmailProps, activityMjmlTemplate } from '../activity-emails/activity.email-template';

const testIssuanceEmailData: ActivityEmailProps = {
  baseUrl: `http://www.file.gov.sg`,
  imageAssetsUrl: `http://www.file.gov.sg/assets/images/icons`,
  agencyIcon: 'http://www.file.gov.sg/assets/images/icons/miscellaneous/filesg.png',
  agencyCode: 'FSG',
  agencyFullName: 'File SG',
  transactionName: 'Issuance of digital certificate',
  activityId: 'activity-uuid-1',
  recipientName: 'user-01',
  retrievalPageUrl: `http://www.file.gov.sg/retrieve?source=email`,
  fileList: [mockFileAsset1, mockFileAsset2],
  externalRefId: 'external-ref-id-01',
  customMessage: ['email-message-1', 'email-message-2'],
  currentDate: new Date(),
  password: 'testPassword',
};

const issuanceMock = activityMjmlTemplate(EMAIL_TYPES.ISSUANCE, testIssuanceEmailData);
const testEmailTemplate = mjml2html(issuanceMock, {}).html;
const emailNode = document.createElement('div');
emailNode.innerHTML = testEmailTemplate as string;

describe('Issuance email notification', () => {
  it('renders Header correctly', () => {
    const logo = emailNode.querySelectorAll('img')[0];
    expect(logo?.getAttribute('src')).toEqual(testIssuanceEmailData.agencyIcon);

    const title = emailNode.querySelectorAll('h1')[0];
    expect(title?.textContent).toEqual(testIssuanceEmailData.transactionName);
  });

  it('Renders recipients name, Ref num and transaction id details correctly', () => {
    const recipientNameLabel = emailNode.querySelectorAll('h3')[0];
    expect(recipientNameLabel?.textContent).toEqual('Recipient Name');

    const recipientNameValue = emailNode.querySelectorAll('p')[1];
    expect(recipientNameValue?.textContent).toEqual(testIssuanceEmailData.recipientName);

    const applicationRefNumLabel = emailNode.querySelectorAll('h3')[1];
    expect(applicationRefNumLabel?.textContent).toEqual('Agency Reference No.');

    const applicationRefNumValue = emailNode.querySelectorAll('p')[2];
    expect(applicationRefNumValue?.textContent).toEqual(testIssuanceEmailData.externalRefId);

    const transactionNameLabel = emailNode.querySelectorAll('h3')[2];
    expect(transactionNameLabel?.textContent).toEqual('Transaction ID');

    const transactionNameValue = emailNode.querySelectorAll('p')[3];
    expect(transactionNameValue?.textContent).toEqual(testIssuanceEmailData.activityId);
  });

  it('renders Sent files correctly', () => {
    const numberOfFileLabel = emailNode.querySelectorAll('p')[8];
    expect(numberOfFileLabel?.textContent).toEqual(
      `${testIssuanceEmailData.fileList.length} ${testIssuanceEmailData.fileList.length === 1 ? 'file' : 'files'} issued: `,
    );
  });

  it('renders CTA buttons correctly', () => {
    const openInFileSGBttn = emailNode.querySelectorAll('a')[0];
    expect(openInFileSGBttn?.textContent?.trim()).toEqual('Open in FileSG');
  });

  it('renders Footer correctly', () => {
    const smallElements = Array.from(emailNode.querySelectorAll('small'));
    const footerText = smallElements[smallElements.length - 2];
    expect(footerText?.textContent?.trim()).toEqual(
      `FileSG is a secure digital document management platform that allows members of the public to easily access and download documents issued by the government.  Learn more at http://www.file.gov.sg.`,
    );
  });

  it('renders encryption texts correctly', () => {
    const encryptionText1 = emailNode.querySelectorAll('h3')[3];
    expect(encryptionText1?.textContent).toEqual(
      `For enhanced security, all files in this transaction have been encrypted with this randomly generated password:`,
    );

    const encryptionPassword = emailNode.querySelectorAll('h3')[4];
    expect(encryptionPassword?.textContent).toEqual(testIssuanceEmailData.password);

    const encryptionText2 = emailNode.querySelectorAll('h3')[5];
    expect(encryptionText2?.textContent).toEqual(`Please do not share the password with anyone.`);
  });

  it('renders Timestamp & Copywrite texts correctly', () => {
    const smallElements = Array.from(emailNode.querySelectorAll('small'));
    const copywrite = smallElements[smallElements.length - 1];
    expect(copywrite?.textContent).toEqual(
      `Copyright © ${new Date().getFullYear()} FileSG. Developed by the Government Technology Agency (GovTech) Singapore.`,
    );
  });
});
