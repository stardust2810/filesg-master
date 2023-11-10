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
  // lastBuiltAt is auto injected during build, no need to put manually
  lastBuiltAt: getValueFromEnv('LAST_BUILT_AT', '') as unknown as number,
};
