import 'dotenv/config';

import { EncryptionTransformer } from 'typeorm-encrypted';

// Accessing using process.env as entity cannot access config service
const OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_KEY = process.env.OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_KEY!;
const OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_ALGO = process.env.OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_ALGO!;
const OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_IV_LENGTH = parseInt(process.env.OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_IV_LENGTH!);

const DOC_ENCRYPTION_PASSWORD_ENCRYPTION_KEY = process.env.DOC_ENCRYPTION_PASSWORD_ENCRYPTION_KEY!;
const DOC_ENCRYPTION_PASSWORD_ENCRYPTION_ALGO = process.env.DOC_ENCRYPTION_PASSWORD_ENCRYPTION_ALGO!;
const DOC_ENCRYPTION_PASSWORD_ENCRYPTION_IV_LENGTH = parseInt(process.env.DOC_ENCRYPTION_PASSWORD_ENCRYPTION_IV_LENGTH!);

const OA_IMAGE_ID_ENCRYPTION_KEY = process.env.OA_IMAGE_ID_ENCRYPTION_KEY!;
const OA_IMAGE_ID_ENCRYPTION_ALGO = process.env.OA_IMAGE_ID_ENCRYPTION_ALGO!;
const OA_IMAGE_ID_ENCRYPTION_IV_LENGTH = parseInt(process.env.OA_IMAGE_ID_ENCRYPTION_IV_LENGTH!);

// =============================================================================
// Agency's oa document signing key encryption
// =============================================================================
export const oaSigningKeyEncryptionTransformer = new EncryptionTransformer({
  key: OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_KEY,
  algorithm: OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_ALGO,
  ivLength: OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_IV_LENGTH,
});

// =============================================================================
// Doc encryption password encryption (to make sure the password is not in plain
// when flowing through queues and logs)
// =============================================================================
export const docEncryptionPasswordEncryptionTransformer = new EncryptionTransformer({
  key: DOC_ENCRYPTION_PASSWORD_ENCRYPTION_KEY,
  algorithm: DOC_ENCRYPTION_PASSWORD_ENCRYPTION_ALGO,
  ivLength: DOC_ENCRYPTION_PASSWORD_ENCRYPTION_IV_LENGTH,
});

// =============================================================================
// OA image id encryption
// =============================================================================
export const oaImageIdEncryptionTransformer = new EncryptionTransformer({
  key: OA_IMAGE_ID_ENCRYPTION_KEY,
  algorithm: OA_IMAGE_ID_ENCRYPTION_ALGO,
  ivLength: OA_IMAGE_ID_ENCRYPTION_IV_LENGTH,
});
