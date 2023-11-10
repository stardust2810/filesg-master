import { createHash } from 'crypto';

export default function generateChecksum(fileBuffer: Buffer | string) {
  return createHash('sha256').update(fileBuffer).digest('hex');
}
