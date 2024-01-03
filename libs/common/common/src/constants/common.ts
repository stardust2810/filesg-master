// =============================================================================
// Enums
// =============================================================================

import { CreateRecipientV2Request } from '../dtos/transaction/request';
import { ActivatedFileStatus, FileStatisticAuditEvent, UserFileAuditEvent, ViewableFileStatus } from '../typings/common';

// Common
export enum ACTIVITY_SORT_BY {
  CREATED_AT = 'createdAt',
}

export enum FILE_ASSET_SORT_BY {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  LAST_VIEWED_AT = 'lastViewedAt',
}

export enum STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum USER_TYPE {
  AGENCY = 'agency',
  CITIZEN = 'citizen',
  PROGRAMMATIC = 'programmatic',
  ESERVICE = 'eservice',
  CORPORATE = 'corporate',
  CORPORATE_USER = 'corporate-user',
}

export enum AUTH_TYPE {
  SINGPASS = 'Singpass',
  NON_SINGPASS = 'Non-Singpass',
  SINGPASS_SSO = 'Singpass-SSO',
  CORPPASS = 'Corppass',
}

export enum ROLE {
  PROGRAMMATIC_WRITE = 'PROGRAMMATIC_WRITE', // programmatic use that can create/update data
  PROGRAMMATIC_READ = 'PROGRAMMATIC_READ', // programmatic user that can only query for data
  SYSTEM = 'SYSTEM', // for internal endpoint
  CITIZEN = 'CITIZEN', // default user's role
  CORPORATE = 'CORPORATE', // corporate (company) account
  CORPORATE_USER = 'CORPORATE_USER', // corporate user (individual corppass user)
  PROGRAMMATIC_SYSTEM_INTEGRATION = 'PROGRAMMATIC_SYSTEM_INTEGRATION', // ROLE to be used for internal sys-to-sys integration
  FORMSG = 'FORMSG',
}

export enum INTEGRATION_TYPE {
  FORMSG = 'formsg',
}

export enum SSO_ESERVICE {
  MY_ICA = 'myIca',
}

export enum DATE_FORMAT_PATTERNS {
  DATE_COMMA_TIME = 'd MMM yyyy, h:mm a',
  DATE_TIME = 'd MMM yyyy h:mm a',
  OFFSET = "'GMT' XXX",
  DATE = 'd MMM yyyy',
  TIME = 'h:mm a',
  FULL_DATE = 'd MMMM yyyy',
  TRANSACTION_DATE = 'yyyyMMdd',
  API_FORMAT = 'yyyy-MM-dd',
}

// File Asset
export enum FILE_TYPE {
  OA = 'oa',
  PDF = 'pdf',
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  ZIP = 'zip',
  UNKNOWN = 'unknown',
}

export enum FILE_STATUS {
  INIT = 'init', // initial state of the file
  SCANNING = 'scanning', // state after file upload to stg is completed and ready for scan
  CLEAN = 'clean', // state after passed the scan stage
  FAILED = 'failed', // state when error in scan, upload-move or transfer-move stage
  ACTIVE = 'active', // state when file has passed through all stages and is valid
  EXPIRED = 'expired',
  PENDING = 'pending',
  REVOKED = 'revoked',
  PENDING_DELETE = 'pending_delete',
  DELETED = 'deleted', // Final state of the file. No further updates to file possible after deletion.
}
// reference to https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export enum MIME_TYPE {
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  OA = 'application/json',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export enum FILE_FAIL_CATEGORY {
  VIRUS = 'virus',
  SCAN_ERROR = 'scanError',
  POST_SCAN_ERROR = 'postScanError',
  UPLOAD_TO_STAG = 'uploadToStaging',
  UPLOAD_MOVE = 'uploadMove',
  TRANSFER_MOVE = 'transferMove',
  DELETION = 'deletion',
}

export enum FILE_ASSET_ACTION {
  ISSUED = 'issued',
  REVOKED = 'revoked',
  DELETED = 'deleted',
  DOWNLOADED = 'downloaded',
  EXPIRED = 'expired',
  VIEWED = 'viewed',
}

export enum OA_TYPE {
  LTVP = 'LTVP',
  STP = 'STP',
  DP = 'DP',
}

// Transaction
export enum TRANSACTION_STATUS {
  INIT = 'init', // initial state of the transaction
  DRAFT = 'draft',
  UPLOADED = 'uploaded', // state when passed upload-move stage and ready for transfer-move flow
  FAILED = 'failed', // state when error in scan, upload-move or transfer-move stage
  COMPLETED = 'completed', // state when passed all stages
  RECALLED = 'recalled',
}

export enum TRANSACTION_CREATION_METHOD {
  SYSTEM = 'system',
  API = 'api',
  SFTP = 'sftp',
  FORMSG = 'formsg',
}

export enum TRANSACTION_TYPE {
  UPLOAD = 'upload', // transaction involving only upload
  SHARE = 'share', // transaction involving only share
  TRANSFER = 'transfer', // transaction involving only transfer
  UPLOAD_SHARE = 'upload_share', // transaction involving upload into triggerer bucket then symbolic share to recipient
  UPLOAD_TRANSFER = 'upload_transfer', // transaction involving upload into triggerer's bucket then transfer to recipient'bucket
  WIDGET = 'widget',
  REVOKE = 'revoke',
  EXPIRE = 'expire',
  DELETE = 'delete',
  RECALL = 'recall',
}

// Activity
export enum ACTIVITY_STATUS {
  INIT = 'init', // initial state of the activity
  SCANNING = 'scanning', // state after upload to stg is completed and ready for scan
  CLEAN = 'clean', // state after passed the scan stage
  FAILED = 'failed', // state when error in scan, upload-move or transfer-move stage
  COMPLETED = 'completed', // state when completed
  SENT = 'sent',
  RECALLED = 'recalled',
}

export enum ACTIVITY_TYPE {
  UPLOAD = 'upload',
  SEND_SHARE = 'send_share',
  RECEIVE_SHARE = 'receive_share',
  SEND_TRANSFER = 'send_transfer',
  RECEIVE_TRANSFER = 'receive_transfer',
  SEND_FILE_REQUEST = 'send_file_request',
  RECEIVE_FILE_REQUEST = 'receive_file_request',
  SEND_FILE_SEND_FILE_REQUEST = 'send_file_send_file_request',
  RECEIVE_FILE_RECEIVE_FILE_REQUEST = 'receive_file_receive_file_request',
  SEND_REVOKE = 'send_revoke',
  RECEIVE_REVOKE = 'receive_revoke',
  TRIGGER_EXPIRE = 'trigger_expire',
  RECEIVE_EXPIRE = 'receive_expire',
  TRIGGER_DELETE = 'trigger_delete',
  RECEIVE_DELETE = 'receive_delete',
  SEND_RECALL = 'send_recall',
  RECEIVE_RECALL = 'receive_recall',
}

export enum ACTIVITY_RETRIEVAL_OPTIONS {
  CORPPASS = 'CORPPASS',
  NON_SINGPASS = 'NON_SINGPASS',
  SINGPASS = 'SINGPASS',
}

// OTP
export enum OTP_TYPE {
  NON_SINGPASS_VERIFICATION = 'non-singpass-verification',
  CONTACT_VERIFICATION = 'contact-verification',
}

export enum OTP_CHANNEL {
  SMS = 'sms',
  EMAIL = 'email',
}

// SQS events
export enum EVENT {
  // upload to stg
  FILES_UPLOAD_TO_STG_COMPLETED = 'files_upload_to_stg_completed',
  FILES_UPLOAD_TO_STG_FAILED = 'files_upload_to_stg_failed',
  // post scan
  FILE_SCAN_SUCCESS = 'file_scan_success',
  FILE_SCAN_VIRUS = 'file_scan_virus',
  FILE_SCAN_ERROR = 'file_scan_error',
  POST_SCAN_ERROR = 'post_scan_error',
  // upload move
  FILES_UPLOAD_MOVE_COMPLETED = 'files_upload_move_completed',
  FILES_UPLOAD_MOVE_FAILED = 'files_upload_move_failed',
  // transfer move
  FILES_TRANSFER_MOVE_COMPLETED = 'files_transfer_move_completed',
  FILES_TRANSFER_MOVE_FAILED = 'files_transfer_move_failed',
  // delete file
  FILE_DELETE_SUCCESS = 'file_delete_success',
  FILE_DELETE_FAILED = 'file_delete_failed',
  // file history
  FILES_DOWNLOADED = 'file_downloaded',
  AGENCY_DOWNLOADED_FILES = 'agency_downloaded_files',
  FORMSG_ISSUANCE_SUCCESS = 'formsg_issuance_success',
  FORMSG_ISSUANCE_FAILURE = 'formsg_issuance_failure',
}

// Services System Env
export enum CI_ENVIRONMENT {
  LOCAL = 'local',
  DEV = 'dev',
  SIT = 'sit',
  UAT = 'uat',
  STG = 'stg',
  PRD = 'prd',
}

export enum ENVIRONMENT {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export enum LOG_LEVEL {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Redis File Session
export enum FILE_SESSION_TYPE {
  UPLOAD = 'upload',
  TRANSFER = 'transfer',
  DOWNLOAD = 'download',
  UPLOAD_AUTH = 'upload_auth',
  DELETE = 'delete',
}

export enum FEATURE_TOGGLE {
  ON = 'on',
  OFF = 'off',
}

export enum OA_CERTIFICATE_STATUS {
  ISSUED = 'issued',
  REVOKED = 'revoked',
}

export enum REVOCATION_TYPE {
  EXPIRED = 'expired',
  CANCELLED = 'cancelled', // renewal is also considered cancelled
  UPDATED = 'updated',
  RECALLED = 'recalled',
}

export enum OA_REVOCATION_REASON_CODE {
  UNSPECIFIED = 0,
  KEY_COMPROMISE = 1,
  CA_COMPROMISE = 2,
  AFFILIATION_CHANGED = 3,
  SUPERSEDED = 4,
  CESSATION_OF_OPERATION = 5,
  CERTIFICATE_HOLD = 6,
  REMOVE_FROM_CRL = 8,
  PRIVILEGE_WITHDRAWN = 9,
  A_A_COMPROMISE = 10,
}

// Exception
export enum SERVICE_NAME {
  CORE = 'C',
  TRANSFER = 'T',
  MANAGEMENT = 'M',
  EVENT_LOGS = 'E',
}

// gd TODO: need to restructure because module restructured into entity and module
export enum COMPONENT_ERROR_CODE {
  // Each component will be allocated 20
  // Agency
  AGENCY_SERVICE = '001',
  ESERVICE_SERVICE = '002',
  AGENCY_ONBOARDING_SERVICE = '003',
  APPLICATION_SERVICE = '004',
  APPLICATION_TYPE_SERVICE = '005',
  REPORTING_SERVICE = '006',

  // Auth
  AUTH_SERVICE = '021',
  MOCK_AUTH_SERVICE = '022',

  // Aws
  SES_SERVICE = '041',
  SQS_SERVICE = '042',
  S3_SERVICE = '043',
  STS_SERVICE = '044',
  SNS_SERVICE = '045',

  // Email
  //TODO: Notification to take over
  EMAIL_SERVICE = '061',
  EMAIL_BLACK_LIST_SERVICE = '062',
  NOTIFICATION_SERVICE = '063',
  NOTIFICATION_HISTORY_SERVICE = '064',

  // File
  FILE_SERVICE = '081',
  FILE_ASSET_HISTORY_SERVICE = '082',
  FILE_ASSET_ACCESS_SERVICE = '083',

  // Open Attestation
  OPEN_ATTESTATION_SERVICE = '101',

  // Otp
  OTP_SERVICE = '121',

  // Queue Handler
  SES_QUEUE_HANDLER_SERVICE = '141',
  UPDATE_QUEUE_HANDLER_SERVICE = '142',
  DOWNLOAD_EVENT_SERVICE = '143',
  MOVE_EVENT_SERVICE = '144',
  POST_SCAN_EVENT_SERVICE = '145',
  UPLOAD_EVENT_SERVICE = '146',
  TRANSACTIONAL_EMAIL_HANDLER_SERVICE = '147',

  // Transaction
  TRANSACTION_SERVICE = '161',
  ACTIVITY_SERVICE = '162',
  TRANSACTION_ACTIVITY_SERVICE = '163',
  RECALL_SERVICE = '164',

  // User
  USER_SERVICE = '181',
  CITIZEN_USER_SERVICE = '182',
  AGENCY_USER_SERVICE = '183',
  PROGRAMMATIC_USER_SERVICE = '184',
  ESERVICE_USER_ENTITY_SERVICE = '185',
  CORPORATE_ENTITY_SERVICE = '186',
  CORPORATE_USER_ENTITY_SERVICE = '187',

  // Setups
  CONFIG_VALIDATE = '201',

  // File Upload (Transfer)
  FILE_UPLOAD = '221',
  FILE_UPLOAD_AUTH = '222',

  // File Move (Transfer)
  UPLOAD_TRANSFER_MOVE_SERVICE = '241',
  FILE_MOVE_SERVICE = '242',

  // File Download (Transfer)
  FILE_DOWNLOAD = '261',

  // Transfer Manage (Mgmt)
  TRANSFER_MANAGE_SERVICE = '281',
  FILE_DELETE_SERVICE = '282',

  // Non Singpass Verification
  NON_SINGPASS_VERIFICATION_SERVICE = '301',

  // Contact Update
  USER_CONTACT_UPDATE_SERVICE = '321',

  // Agency Client
  AGENCY_CLIENT_SERVICE = '341',

  // Templates
  ACKNOWLEDGEMENT_TEMPLATE_ENTITY_SERVICE = '361',
  TRANSACTION_CUSTOM_MESSAGE_TEMPLATE_ENTITY_SERVICE = '362',

  // SFTP Processor
  SFTP_PROCESSOR_SERVICE = '381',
  SIDECAR_FILE_SERVICE = '382',
  SFTP_S3_SERVICE = '383',

  // Doc Encryption
  DOC_ENCRYPTION_SERVICE = '401',

  // Audit Event
  AUDIT_EVENT = '421',

  // FormSg Transaction
  FORMSG_SERVICE = '441',

  // Event (Event Logs)
  EVENTS_SERVICE = '461',

  // Other than feature module services starts from 601
  // Guards
  AUTH_GUARD = '601',
  DISABLE_HANDLER_GUARD = '602',
  JWT_NON_SINGPASS_2FA_GUARD = '603',
  JWT_NON_SINGPASS_CONTENT_RETRIEVAL_GUARD = '604',
  JWT_VERIFY_FILE_RETRIEVAL_GUARD = '605',

  // Email Templates
  ISSUANCE_SUCCESS_EMAIL_TEMPLATE = '621',
  EMAIL_FACTORY_TEMPLATE = '622',

  // Dtos
  TRANSACTION_REQUEST_DTO = '641',
  FILE_REQUEST_DTO = '642',

  // Pipes
  VALIDATION_PIPE = '661',

  // Interceptors
  CSRF_INTERCEPTOR = '681',
  TIMEOUT_INTERCEPTOR = '682',

  // Strategies
  JWT_NON_SINGPASS_2FA_STRATEGY = '701',
  JWT_NON_SINGPASS_CONTENT_RETRIEVAL_STRATEGY = '702',
  JWT_VERIFY_FILE_RETRIEVAL_STRATEGY = '703',

  // Guards (Transfer)
  JWT_FILE_DOWNLOAD_GUARD = '721',
  JWT_FILE_UPLOAD_GUARD = '722',

  // Strategies (Transfer)
  JWT_FILE_UPLOAD_STRATEGY = '741',
  JWT_FILE_DOWNLOAD_STRATEGY = '742',

  // SLIFT Service
  SLIFT_SERVICE = '800',

  // Secret Manager Service
  SECRET_MANAGER_SERVICE = '801',

  // Excel
  EXCEL_SERVICE = '821',

  // Pdf
  PDF_SERVICE = '841',

  // SYSTEM
  SYSTEM = '900',
}

// NOTE: Should never re-order the the number when removing item in between, in case code is logged somewhere in production
export enum EXCEPTION_ERROR_CODE {
  // Generic error will follow standard status code
  BAD_REQUEST = '400',
  UNAUTHORIZED = '401',
  FORBIDDEN = '403',
  NOT_FOUND = '404',
  REQUEST_TIMEOUT = '408',
  INTERNAL_SERVER_ERROR = '500',
  BAD_GATEWAY = '502',
  SERVICE_UNAVAILABLE = '503',
  GATEWAY_TIMEOUT = '504',

  // Custom (Only create new entry here if there is a need for frontend to use this to differentiate different error)
  OTP_VERIFICATION_FAILED = '001',
  NON_SINGPASS_VERIFICATION_INVALID_CREDENTIAL = '002',
  DUPLICATE_EMAIL = '004',
  OTP_DOES_NOT_EXIST = '005',
  OTP_MAX_VERIFICATION_ATTEMPT_COUNT_REACHED = '006',
  OTP_EXPIRED = '007',
  OTP_INVALID = '008',
  NON_SINGPASS_VERIFICATION_BAN = '009',
  CONTACT_UPDATE_BAN = '010',
  SAME_EMAIL_UPDATE = '011',
  JWT_EXPIRED = '012',
  PHOTO_RETRIEVAL_OA_INVALID = '013',
  ACTIVITY_HAD_ALREADY_BEEN_ACKNOWLEDGED = '014',
  DUPLICATE_SESSION = '015',
  AGENCY_EMAIL_NOT_WHITELISTED = '016',
  APPLICATION_IS_INVALID = '017',
  DUPLICATE_RECIPIENT_UINS = '018',
  DUPLICATE_FILE_NAMES = '019',
  RECIPIENT_EMAIL_BLACKLISTED = '020',
  TRANSACTION_IS_INVALID = '021',
  FILE_UPLOAD_FAILED = '022',
  DUPLICATE_RECIPIENT_UENS = '023',

  UNEXPECTED_ERROR = '999',
}

export enum AUDIT_EVENT_NAME {
  AGENCY_FILE_DOWNLOAD = 'agency-file-download',
  USER_FILE_DOWNLOAD = 'user-file-download',
  USER_FILE_PRINT_SAVE = 'user-file-print-save',
  USER_FILE_VIEW = 'user-file-view',
  USER_LOGIN = 'user-login',
}

// =============================================================================
// Documentation
// =============================================================================
export enum ERROR_RESPONSE_DESC {
  UNAUTHORISED = 'Unauthorized. Not logged in.',
  JWT_UNAUTHORISED = 'Unauthorized. Invalid JWT.',
  FORBIDDEN_ADMIN_ONLY = 'Forbidden. Requires admin rights.',
  FORBIDDEN_CLIENT_ONLY = 'Forbidden. Requires client rights.',
  FORBIDDEN_CITIZEN_ONLY = 'Forbidden. Requires citizen rights.',
  FORBIDDEN_CORPORATE_ONLY = 'Forbidden. Requires corporate rights',
  NOT_FOUND_UINFIN = 'Requested uinfin could not be found.',
  NOT_FOUND_CERTIFICATE = 'Requested certificateId could not be found.',
  NOT_FOUND_ACTIVITY = 'Requested activityId could not be found',
  NOT_FOUND_TRANSACTION = 'Requested transactionId could not be found.',
  NOT_FOUND_FILE_ASSET = 'Requested fileAssetUuid could not be found.',
  NOT_FOUND_FILE_ASSET_HISTORY = 'Requested fileAsset history could not be found',
}

// =============================================================================
// Agency Client
// =============================================================================
export enum CIRIS_STATUS_CODE {
  R000 = 'Success',
  R001 = 'No photo found for the applicant',
  R002 = 'Invalid data provided',
  R003 = 'Mandatory field not provided',
  R005 = 'System Error',
}

// =============================================================================
// Iframe postMessage
// =============================================================================
export enum RENDERER_MESSAGE_TYPE {
  ERROR = 'error',
  PRINT = 'print',
  PROFILE_IMAGE_LOADED = 'profile-image-loaded',
}

export enum RENDERER_ERROR_TYPE {
  IMAGE_NOT_LOADED = 'image-not-loaded',
}

// =============================================================================
// Constants
// =============================================================================

export const COOKIE_HEADER = 'x-csrf-token';
export const COOKIE_ID = 'filesg-cookie-id';
export const CSRF_KEY = 'filesg-csrf-id';

export const PROJECT_TITLE = 'FileSG Document Wallet';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss z';

//FIXME: needs a better name; is usable, but before delete
/**
 * File asset statuses where the document is viewable / renderable.
 * - Mainly used for queries where deleted file assets shouldn't be queried
 * - e.g. MyFiles Page (paginated query & uuid list), download jwt check, File asset history list
 */
export const VIEWABLE_FILE_STATUSES: ViewableFileStatus[] = [FILE_STATUS.ACTIVE, FILE_STATUS.EXPIRED, FILE_STATUS.REVOKED];

/**
 * File asset statuses that are post issuance (not init, scanning or clean/failed)
 * - Mainly used for queries that still requires infomation on deleted file assets
 * - e.g. Document page (to show deleted message), Activities / Individual Activity page
 */
export const ACTIVATED_FILE_STATUSES: ActivatedFileStatus[] = [
  FILE_STATUS.ACTIVE,
  FILE_STATUS.EXPIRED,
  FILE_STATUS.REVOKED,
  FILE_STATUS.PENDING_DELETE,
  FILE_STATUS.DELETED,
];

export const VIEWABLE_ACTIVITY_TYPES = [
  ACTIVITY_TYPE.RECEIVE_TRANSFER,
  ACTIVITY_TYPE.RECEIVE_EXPIRE,
  ACTIVITY_TYPE.RECEIVE_REVOKE,
  ACTIVITY_TYPE.RECEIVE_DELETE,
];

export const VIEWABLE_USER_TYPES = [USER_TYPE.CITIZEN, USER_TYPE.CORPORATE];

export const DEFAULT_HISTORY_TYPE: Array<FILE_ASSET_ACTION> = Object.values(FILE_ASSET_ACTION).filter(
  (action) => action !== FILE_ASSET_ACTION.VIEWED,
);

export const RECIPIENT_ACTIVITY_TYPES = VIEWABLE_ACTIVITY_TYPES;

export const PATH_TRAVERSAL_REGEX = /^[A-Za-z]+$/;

export const SANIZE_HTML_ESCAPED_CHAR_REPLACE_OBJECT: Record<string, string> = {
  '&amp;': '&',
};

export const USER_FILE_AUDIT_EVENTS: UserFileAuditEvent[] = [
  AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
  AUDIT_EVENT_NAME.USER_FILE_PRINT_SAVE,
  AUDIT_EVENT_NAME.USER_FILE_VIEW,
];

export const FILE_STATISTICS_AUDIT_EVENTS: FileStatisticAuditEvent[] = [
  ...USER_FILE_AUDIT_EVENTS,
  AUDIT_EVENT_NAME.USER_LOGIN,
  AUDIT_EVENT_NAME.AGENCY_FILE_DOWNLOAD,
];

export enum TEMPLATE_TYPE {
  TRANSACTION_CUSTOM_MESSAGE = 'TRANSACTION_CUSTOM_MESSAGE',
  NOTIFICATION_MESSAGE = 'NOTIFICATION_MESSAGE',
}

export const RECALLABLE_TRANSACTION_TYPES: TRANSACTION_TYPE[] = [TRANSACTION_TYPE.UPLOAD_TRANSFER];

// =============================================================================
// Regex
// =============================================================================
export const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const TRANSACTION_TEMPLATE_REGEX = /^(transactioncustommessagetemplate-)(\d{13})(-[a-zA-Z0-9]{16})$/;
export const NOTIFICATION_TEMPLATE_REGEX = /^(notificationmessagetemplate-)(\d{13})(-[a-zA-Z0-9]{16})$/;

export const FILE_ASSET_UUID_SIGNATURE_REGEX = /^(fileasset-)(\d{13})(-[a-zA-Z0-9]{16})$/;
export const USER_UUID_SIGNATURE_REGEX = /^(citizenuser-)(\d{13})(-[a-zA-Z0-9]{16})$/;
export const FILE_ACCESS_TOKEN_SIGNATURE_REGEX = /^\d{13}:[0-9a-fA-F]{128}$/;

// =============================================================================
// Notification Channels
// =============================================================================
export enum NOTIFICATION_CHANNEL {
  EMAIL = 'EMAIL',
  SG_NOTIFY = 'SG_NOTIFY',
}

export enum RECIPIENT_TYPE {
  CITIZEN = 'citizen',
  CORPORATE = 'corporate',
}

export const REQUIRED_RECIPIENT_FIELD_FOR_NOTIFICATION: Record<
  NOTIFICATION_CHANNEL,
  Partial<Record<RECIPIENT_TYPE, keyof CreateRecipientV2Request>>
> = {
  [NOTIFICATION_CHANNEL.EMAIL]: { [RECIPIENT_TYPE.CITIZEN]: 'email', [RECIPIENT_TYPE.CORPORATE]: 'emails' },
  [NOTIFICATION_CHANNEL.SG_NOTIFY]: { [RECIPIENT_TYPE.CITIZEN]: 'uin' },
};

export enum NOTIFICATION_STATUS {
  INIT = 'init', // For emails, since SES send command doesn't confirm the delivery
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum NOTIFICATION_TEMPLATE_TYPE {
  ISSUANCE = 'ISSUANCE',
  CANCELLATION = 'CANCELLATION',
  DELETION = 'DELETION',
  RECALL = 'RECALL',
}

// =============================================================================
// FormSG
// =============================================================================
export enum FORMSG_FAIL_CATEGORY {
  AGENCY_EMAIL_NOT_WHITELISTED = 'Agency Officer Email not whitelisted',
  APPLICATION_IS_INVALID = 'Application Type is invalid',
  DUPLICATE_RECIPIENT_UINS = 'Duplicate Recipient UINs',
  DUPLICATE_FILE_NAMES = 'Duplicate filenames',
  RECIPIENT_EMAIL_BLACKLISTED = 'Recipient Email blacklisted',
  RECIPIENT_EMAIL_BOUNCED = 'Recipient Email bounced',
  RECIPIENT_EMAIL_COMPLAINED = 'Recipient Email complained',
  INVALID_TRANSACTION_UUID = 'Transaction uuid provided is invalid.',
  FILE_CONTAINS_VIRUS = 'File contains virus',
  FILE_SCAN_FAILED = 'File scan failed',
  FILE_UPLOAD_FAILED = 'File upload failed',
  CRITICAL_ERROR = 'Critical error',
  UNEXPECTED_ERROR = 'Unexpected error',

  // Batch
  SIDECAR_FILE_NOT_ZIP = 'Sidecar file not in ZIP file format',
  SIDECAR_CSV_DOESNT_EXIST = 'CSV does not exist or is incorrectly named',
  SIDECAR_CSV_HEADER_INCORRECT = 'CSV header(s) provided are incorrect',
  EXCEED_MAX_TRANSACTION_COUNT = 'Number of Transactions exceeded maximum',
  FILES_MISMATCH = 'Files available in Sidecar ZIP file does not match filenames indicated to be issued in CSV',
}

export const FORMSG_EXCEPTION_ERROR_CODE_TO_FAIL_CATEGORY: Partial<Record<EXCEPTION_ERROR_CODE, FORMSG_FAIL_CATEGORY>> = {
  [EXCEPTION_ERROR_CODE.AGENCY_EMAIL_NOT_WHITELISTED]: FORMSG_FAIL_CATEGORY.AGENCY_EMAIL_NOT_WHITELISTED,
  [EXCEPTION_ERROR_CODE.APPLICATION_IS_INVALID]: FORMSG_FAIL_CATEGORY.APPLICATION_IS_INVALID,
  [EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS]: FORMSG_FAIL_CATEGORY.DUPLICATE_RECIPIENT_UINS,
  [EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES]: FORMSG_FAIL_CATEGORY.DUPLICATE_FILE_NAMES,
  [EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED]: FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED,
  [EXCEPTION_ERROR_CODE.FILE_UPLOAD_FAILED]: FORMSG_FAIL_CATEGORY.FILE_UPLOAD_FAILED,
  [EXCEPTION_ERROR_CODE.UNEXPECTED_ERROR]: FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR,
  [EXCEPTION_ERROR_CODE.TRANSACTION_IS_INVALID]: FORMSG_FAIL_CATEGORY.INVALID_TRANSACTION_UUID,
};
