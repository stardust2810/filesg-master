import { SidecarData } from '../common/dtos/sidecar-data';

// =============================================================================
// Misc
// =============================================================================
export const CORE_API_CLIENT_PROVIDER = 'CORE_API_CLIENT_PROVIDER';
export const TRANSFER_API_CLIENT_PROVIDER = 'TRANSFER_API_CLIENT_PROVIDER';

export const SLIFT_ENCRYPTED_FILE_EXT = '.p7';
export const SLIFT_RECEIVER_PFX_BASE64 = 'fsg2/SLIFT_RECEIVER_PFX_BASE64';
export const SLIFT_RECEIVER_PFX_PASSWORD = 'fsg2/SLIFT_RECEIVER_PFX_PASSWORD';

export const RESULT_LOG_PREFIX = 'SFTP_PROCESSOR_RESULT';
export const NEWLINE_DELIMITER = '#newline';
// =============================================================================
// Dir
// =============================================================================
export const DOWNLOAD_DIR = '/tmp';
export const S3_PROCESSING_DIR_PREFIX = 'processing';
export const LOCAL_EXTRACTED_SUBPATH = 'extracted';

// =============================================================================
// Sidecar Files
// =============================================================================
export const TRANSACTION_SIDECAR_FILENAME = 'filesg-sidecar-transactioninfo.csv';
export const RECIPIENT_SIDECAR_FILENAME = 'filesg-sidecar-recipients.csv';
export const FILE_SIDECAR_FILENAME = 'filesg-sidecar-files.csv';
export const NOTIFICATIONS_SIDECAR_FILENAME = 'filesg-sidecar-notifications.csv';
export const AGENCY_PASSWORD_SIDECAR_FILENAME = 'filesg-sidecar-agency-password.csv';

export const TRANSACTION_SIDECAR_HEADERS = [
  'applicationType',
  'applicationExternalRefId',
  'transactionName',
  'transactionType',
  'transactionMessageId',
  'transactionMessageInput',
  'isAcknowledgementRequired',
  'acknowledgementTemplateId',
  'clientId',
  'clientSecret',
];
export const RECIPIENT_SIDECAR_HEADERS = ['uin', 'fullName', 'email', 'dob', 'contact', 'metadata'];
export const FILE_SIDECAR_HEADERS = ['name', 'checksum', 'metadata', 'expiry', 'deleteAt', 'isPasswordEncryptionRequired'];
export const NOTIFICATIONS_SIDECAR_HEADERS = ['channel', 'templateId', 'templateInput'];
export const AGENCY_PASSWORD_SIDECAR_HEADERS = ['filePath', 'password'];
/**
 * This array is to ensure the sequence of parsing csv, putting the parsedCsv into the correct key (in SidecarData)
 */
export const SIDECAR_FILES_INFO: Array<{
  key: keyof SidecarData;
  name: string;
  headers: string[];
  headersWithJSONStringValue: string[];
  required: boolean;
}> = [
  {
    key: 'transactions',
    name: TRANSACTION_SIDECAR_FILENAME,
    headers: TRANSACTION_SIDECAR_HEADERS,
    headersWithJSONStringValue: ['transactionMessageInput'],
    required: true,
  },
  {
    key: 'recipients',
    name: RECIPIENT_SIDECAR_FILENAME,
    headers: RECIPIENT_SIDECAR_HEADERS,
    headersWithJSONStringValue: [],
    required: true,
  },
  {
    key: 'files',
    name: FILE_SIDECAR_FILENAME,
    headers: FILE_SIDECAR_HEADERS,
    headersWithJSONStringValue: [],
    required: true,
  },
  {
    key: 'notifications',
    name: NOTIFICATIONS_SIDECAR_FILENAME,
    headers: NOTIFICATIONS_SIDECAR_HEADERS,
    headersWithJSONStringValue: ['templateInput'],
    required: true,
  },
  {
    key: 'agencyPassword',
    name: AGENCY_PASSWORD_SIDECAR_FILENAME,
    headers: AGENCY_PASSWORD_SIDECAR_HEADERS,
    headersWithJSONStringValue: [],
    required: false,
  },
];
