import { FileUploadJwtPayload, JwtPayload } from '@filesg/backend-common';
import { v2 } from '@govtechsg/open-attestation';
import { Request } from 'express';
import { MimeType } from 'file-type';

// =============================================================================
// Consts
// =============================================================================
export const MGMT_SERVICE_API_CLIENT_PROVIDER = Symbol('MGMT_SERVICE_API_CLIENT_PROVIDER');
export const DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER = Symbol('DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER');
export const AWS_LAMBDA_HTTPS_AGENT_PROVIDER = Symbol('AWS_LAMBDA_HTTPS_AGENT_PROVIDER');
export const AWS_LAMBDA_NODE_HTTPS_HANDLER_PROVIDER = Symbol('AWS_LAMBDA_NODE_HTTPS_HANDLER_PROVIDER');

// =============================================================================
// OA OBFUSCARTION KEYS
// =============================================================================
export const OA_AGENCY_DATA_KEY = 'agencyData';
export const OA_OBFUSCATION_KEYS = ['sex', 'nationality', 'address'];

// =============================================================================
// Typings
// =============================================================================
export interface RawDocument extends v2.OpenAttestationDocument {
  agencyData: Record<string, string>;
}

// -----------------------------------------------------------------------------
// File Upload
// -----------------------------------------------------------------------------
export interface FileUploadDetailsBase {
  type: 'OA' | 'UPLOAD_MODE' | 'COPY_MODE';
  name: string;
  fileAssetId: string;
  generatedChecksum: string;
  expectedChecksum: string;
  isPasswordEncryptionRequired?: boolean;
  encryptedAgencyPassword?: string;
  size: number;
}

export interface OaFileUploadDetails extends FileUploadDetailsBase {
  type: 'OA';
  oaCertificateId: string;
  oaCertificateHash: string;
  buffer: Buffer;
  encryptedAgencyPassword?: never;
}

export interface UploadModeFileUploadDetails extends FileUploadDetailsBase {
  type: 'UPLOAD_MODE';
  mimeType: MimeType | undefined;
  buffer: Buffer;
}

export interface CopyModeFileUploadDetails extends FileUploadDetailsBase {
  type: 'COPY_MODE';
  mimeType: MimeType | undefined;
  fromBucket: string;
  fromKey: string;
}

export type FileUploadDetails = OaFileUploadDetails | UploadModeFileUploadDetails | CopyModeFileUploadDetails;

// -----------------------------------------------------------------------------
// File Download
// -----------------------------------------------------------------------------

export interface FileDownloadJwtPayload extends JwtPayload {
  fileSessionId: string;
}

export interface FileDownloadRequest extends Request {
  user: Omit<FileDownloadJwtPayload, 'type'>;
}

// -----------------------------------------------------------------------------
// File Upload
// -----------------------------------------------------------------------------
export type FileUploadJwtPayloadInRequest = Omit<FileUploadJwtPayload, 'type'>;

export interface FileUploadRequest extends Request {
  user: FileUploadJwtPayloadInRequest;
}
