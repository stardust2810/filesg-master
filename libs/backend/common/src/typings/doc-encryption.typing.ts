import { AgencyPassword, AssumeUploadMoveRole } from '@filesg/common';
import { FileTypeResult } from 'file-type';

export interface DocumentEncryptionInput {
  fileName: string;
  fromKey: string;
  toKey: string;
  assumeRole: AssumeUploadMoveRole;
  password: string;
  agencyPassword?: AgencyPassword;
}

export interface DocumentEncryptionSuccessOutput {
  fromKey: string;
  toKey: string;
  size: number;
}

export interface DocumentEncryptionErrorOutput {
  errorMessage: string;
  isHeadObjectError?: boolean;
}

export type DocumentEncryptionOutput = DocumentEncryptionSuccessOutput | DocumentEncryptionErrorOutput;

export type FileType = FileTypeResult | undefined;
