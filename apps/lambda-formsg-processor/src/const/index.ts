export const CORE_API_CLIENT_PROVIDER = 'CORE_API_CLIENT_PROVIDER';
export const TRANSFER_API_CLIENT_PROVIDER = 'TRANSFER_API_CLIENT_PROVIDER';
export const EVENT_LOGS_API_CLIENT_PROVIDER = 'EVENT_LOGS_API_CLIENT_PROVIDER';

//===============================================
// API Endpoints
//===============================================
// Core
export const CREATE_SINGLE_ISSUANCE_TRANSACTION_PATH = 'v1/formsg/transaction/issuance/single';
export const CREATE_BATCH_ISSUANCE_TRANSACTION_PATH = 'v1/formsg/transaction/issuance/batch';
export const RECALL_TRANSACTION_PATH = 'v1/formsg/transaction/recall';

// Transfer
export const FILE_UPLOAD_PATH = 'v1/file-upload';

// Event Logs
export const EVENT_LOG_PATH = '/v1/events';

// =============================================================================
// Enums
// =============================================================================
export enum FORMSG_FORM_TYPE {
  SINGLE_ISSUANCE = 'single-issuance',
  BATCH_ISSUANCE = 'batch-issuance',
  RECALL_TRANSACTION = 'recall-transaction',
}

// =============================================================================
// Secret Keys
// =============================================================================
export const SECRET_MANAGER_FSG_APP_PREFIX = 'fsg2';
export const FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_NAME = 'FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET';
export const FORMSG_SINGLE_ISSUANCE_FORM_SECRET_NAME = 'FORMSG_SINGLE_ISSUANCE_FORM_SECRET';
export const FORMSG_BATCH_ISSUANCE_FORM_SECRET_NAME = 'FORMSG_BATCH_ISSUANCE_FORM_SECRET';
export const FORMSG_RECALL_TRANSACTION_FORM_SECRET_NAME = 'FORMSG_RECALL_TRANSACTION_FORM_SECRET';

export const FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_KEY = `${SECRET_MANAGER_FSG_APP_PREFIX}/${FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_NAME}`;
