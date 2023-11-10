import 'dotenv/config';

import argon2 from 'argon2';
import * as crypto from 'crypto';
import { EncryptionTransformer } from 'typeorm-encrypted';

// Accessing using process.env as entity cannot access config service
const DB_FIELD_ENCRYPTION_KEY = process.env.DB_FIELD_ENCRYPTION_KEY!;
const DB_FIELD_ENCRYPTION_ALGO = process.env.DB_FIELD_ENCRYPTION_ALGO!;
const DB_FIELD_ENCRYPTION_IV = process.env.DB_FIELD_ENCRYPTION_IV!;
const DB_FIELD_ENCRYPTION_IV_LENGTH = parseInt(process.env.DB_FIELD_ENCRYPTION_IV_LENGTH!);

const OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_KEY = process.env.OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_KEY!;
const OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_ALGO = process.env.OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_ALGO!;
const OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_IV_LENGTH = parseInt(process.env.OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_IV_LENGTH!);

const DOC_ENCRYPTION_PASSWORD_ENCRYPTION_KEY = process.env.DOC_ENCRYPTION_PASSWORD_ENCRYPTION_KEY!;
const DOC_ENCRYPTION_PASSWORD_ENCRYPTION_ALGO = process.env.DOC_ENCRYPTION_PASSWORD_ENCRYPTION_ALGO!;
const DOC_ENCRYPTION_PASSWORD_ENCRYPTION_IV_LENGTH = parseInt(process.env.DOC_ENCRYPTION_PASSWORD_ENCRYPTION_IV_LENGTH!);

const OA_IMAGE_ID_ENCRYPTION_KEY = process.env.OA_IMAGE_ID_ENCRYPTION_KEY!;
const OA_IMAGE_ID_ENCRYPTION_ALGO = process.env.OA_IMAGE_ID_ENCRYPTION_ALGO!;
const OA_IMAGE_ID_ENCRYPTION_IV_LENGTH = parseInt(process.env.OA_IMAGE_ID_ENCRYPTION_IV_LENGTH!);

export function generateRandomString(length = 16) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
}

export function hash(algorithm: string, stringToHash: string, key?: string) {
  let hash: crypto.Hash | crypto.Hmac;
  if (!key) {
    hash = crypto.createHash(algorithm);
  } else {
    hash = crypto.createHmac(algorithm, key);
  }
  hash.update(stringToHash);
  return hash.digest('hex').toString();
}

// =============================================================================
// Database field encryption
// =============================================================================
export function getDbColumnEncryptionTransformer() {
  return new EncryptionTransformer({
    key: DB_FIELD_ENCRYPTION_KEY,
    algorithm: DB_FIELD_ENCRYPTION_ALGO,
    ivLength: DB_FIELD_ENCRYPTION_IV_LENGTH,
    iv: DB_FIELD_ENCRYPTION_IV,
  });
}

// =============================================================================
// Agency's oa document signing key encryption
// =============================================================================
/**
 * The reason for this extends is to create a transformer with overwritten 'from' function
 * whereby it will encrypt the value when saving but doesnt decrypt when reading
 */
class OaSigningKeyEncryptionTransformer extends EncryptionTransformer {
  from(value?: string | null): string | undefined {
    if (value !== null) {
      return value;
    }
  }
}

export const oaSigningKeyEncryptionTransformer = new OaSigningKeyEncryptionTransformer({
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

// TODO: explore provider method
export const oaImageIdEncryptionTransformer = new EncryptionTransformer({
  key: OA_IMAGE_ID_ENCRYPTION_KEY,
  algorithm: OA_IMAGE_ID_ENCRYPTION_ALGO,
  ivLength: OA_IMAGE_ID_ENCRYPTION_IV_LENGTH,
});

// =============================================================================
// Argon2 hashing
// =============================================================================
export async function argon2Hash(input: string): Promise<string> {
  return await argon2.hash(input);
}

export async function verifyArgon2Hash(hashedValue: string, plainValue: string): Promise<boolean> {
  return await argon2.verify(hashedValue, plainValue);
}
