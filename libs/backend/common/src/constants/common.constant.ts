export const HTTP_AGENT_PROVIDER = Symbol('HTTP_AGENT_PROVIDER');
export const HTTPS_AGENT_PROVIDER = Symbol('HTTPS_AGENT_PROVIDER');
export const NODE_HTTPS_HANDLER_PROVIDER = Symbol('NODE_HTTPS_HANDLER_PROVIDER');

export enum JWT_TYPE {
  NON_SINGPASS_2FA = 'non-singpass-2fa',
  NON_SINGPASS_CONTENT_RETRIEVAL = 'non-singpass-content-retrieval',
  FILE_UPLOAD = 'file-upload',
  FILE_DOWNLOAD = 'file-download',
  VERIFY = 'verify',
}

export enum MaskType {
  PHONE_NUMBER = 'phoneNumber',
  UIN = 'uin',
}

export type ErrorLogLevel = 'warn' | 'error';

export const OPS_SUPPORT_CONTEXT = '[OPS-SUPPORT]';

export const PROPERTY_KEY_TO_NAME_MAP: Record<string, string> = {
  uin: 'Recipient UIN',
  email: 'Recipient Email',
  contact: 'Recipient Contact',
  dob: 'Recipient Date of Birth',
  deleteAt: 'Delete At Date',
  expiry: 'Expiry Date',
};
