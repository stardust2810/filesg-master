/* eslint-disable security/detect-non-literal-fs-filename */
require('tsconfig-paths/register');
import { Command } from 'commander';
import fs from 'fs';

import { FileAsset } from '../../../entities/file-asset';
import { EMAIL_TYPES } from '../../../utils/email-template';
import { activityMjmlTemplate } from '../activity-emails/activity.email-template';
import { emailDeliveryFailureMjmlTemplate } from '../email-delivery-failure.email-template';
import { otpEmailTemplate } from '../otp.email-template';
import { virusOrScanErrorNotificationMjmlTemplate } from '../virus-scan-error-notification.email-template';

/**
 * This script is used for the development of mjml email template in this project
 *
 * Run this script by: npm run generate:email-template <type>
 * e.g. For issuance email template, run $ npm run generate:email-template issuance
 */
const outputDir = 'apps/service-core/src/common/email-template/scripts/dist/';
const program = new Command();
program.option('-t, --type <type>', 'the email type to be generated (e.g. issuance | cancellation)');
program.parse();

// TEST DATA
const file = {
  name: 'file-1.oa',
  deleteAt: new Date('2023-02-02'),
} as FileAsset;

const mockImageAssetUrl = 'https://www.dev.file.gov.sg/assets/images/icons';

const issuanceTestData = {
  agencyCode: 'ELD',
  agencyFullName: 'Elections Department Singapore',
  agencyIcon: 'https://www.dev.file.gov.sg/assets/images/icons/agency/eld/logo.png',
  transactionName: 'Issuance of Election Package',
  recipientName: 'Joey Chan Hsiao An',
  externalRefId: 'ELD-Election Package-202201203322',
  activityId: 'activity-1655284775172-df5dd11fe784d1f4',
  customMessage: [
    'You have been sent an election package from the Elections Department of Singapore (ELD).',
    'You may view and download the files in the package until 8 Feb 2023, after which they will be deleted.',
    'Please click “Open in FileSG” and log in with Singpass.',
    'You will be required to acknowledge that you have received the package before you can view and download the files.',
    'All files are protected with a randomly generated password. You may find the password indicated below.',
  ],
  imageAssetsUrl: mockImageAssetUrl,
  retrievalPageUrl: 'https://www.dev.file.gov.sg/retrieve?source=email',
  baseUrl: 'test',
  fileList: [file, file],
  currentDate: new Date(),
  password: 'testPassword',
};

const cancellationTestData = {
  agencyCode: 'test',
  agencyFullName: 'test',
  agencyIcon: 'https://www.dev.file.gov.sg/assets/images/icons/agency/ica/logo.png',
  transactionName: 'test',
  recipientName: 'test',
  externalRefId: 'test',
  activityId: 'test',
  customMessage: [
    'Your Digital Long-Term Visit Pass (LTVP) has been cancelled with immediate effect. You may still view your cancelled pass, although it will no longer be valid for use.',
    'For more information on the Digital LTVP, please visit http://www.ica.gov.sg/passes/LTVP-digital.',
  ],
  imageAssetsUrl: mockImageAssetUrl,
  baseUrl: 'test',
  fileList: [file, file],
  currentDate: new Date(),
  retrievalPageUrl: 'https://www.dev.file.gov.sg/retrieve?source=email',
};

const verifyEmailTestData = {
  agencyIcon: 'https://www.dev.file.gov.sg/assets/images/icons/miscellaneous/filesg.png',
  inputOtp: '123456',
  recipientName: 'test',
  imageAssetsUrl: mockImageAssetUrl,
  baseUrl: 'test',
  expireAt: new Date(),
  currentDate: new Date(),
};

const emailDeliveryFailedEmailTestData = {
  subject: 'Error sending email to recipient eserviceCode',
  recipientName: 'Agency full name (agencyCode)',
  baseUrl: 'test',
  imageAssetsUrl: mockImageAssetUrl,
  currentDate: new Date(),
  notificationPeriod: `30 Jun 2023 03:00 PM to 30 Jun 2023 07:00 PM`,
  eserviceCode: 'eserviceCode',
};

const virusOrScanErrorEmailTestData = {
  subject: 'test subject',
  recipient: 'Test Recipient',
  affectedFiles: ['Affected File 1', 'Affected File 2'],
  transactionId: 'transaction-uuid-test-id',
  externalRefId: 'external-ref-test-id',
  imageAssetsUrl: mockImageAssetUrl,
  baseUrl: 'test',
  currentDate: new Date(),
};

const emailType = program.opts().type;
const main = () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const logger = fs.createWriteStream(`${outputDir + emailType}.mjml`);

  switch (emailType) {
    case EMAIL_TYPES.ISSUANCE:
      logger.write(activityMjmlTemplate(emailType, issuanceTestData));
      break;
    case EMAIL_TYPES.CANCELLATION:
    case EMAIL_TYPES.DELETION:
      logger.write(activityMjmlTemplate(emailType, cancellationTestData));
      break;
    case EMAIL_TYPES.VERIFY_EMAIL:
      logger.write(otpEmailTemplate(verifyEmailTestData));
      break;
    case EMAIL_TYPES.EMAIL_DELIVERY_FAILED:
      logger.write(emailDeliveryFailureMjmlTemplate(emailDeliveryFailedEmailTestData));
      break;
    case EMAIL_TYPES.VIRUS_SCAN_ERROR:
      logger.write(virusOrScanErrorNotificationMjmlTemplate(virusOrScanErrorEmailTestData));
      break;
    default:
      break;
  }
};

main();
