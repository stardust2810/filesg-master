import env from '@beam-australia/react-env';
import { isNil } from 'lodash-es';

function getValueFromEnv(key: string, defaultValue: string, disableWarrning = false): string {
  const value = env(key) || defaultValue;
  if ((isNil(value) || value.length === 0) && !disableWarrning) {
    // eslint-disable-next-line no-console
    console.warn(`Configuration key not found or empty: ${key}`);
  }
  return value;
}

export const config = {
  portalUrl: getValueFromEnv('PORTAL_URL', ''),
};
