import { createHmac } from 'crypto';

export const sha256HMac = (content: string, salt: string) => {
  const hash = createHmac('sha256', salt);
  hash.update(content);
  return hash.digest('hex');
};
