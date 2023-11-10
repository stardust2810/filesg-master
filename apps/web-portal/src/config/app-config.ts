import env from '@beam-australia/react-env';
import { FEATURE_TOGGLE } from '@filesg/common';
import { isNil } from 'lodash-es';

function getValueFromEnv(key: string, defaultValue: string, disableWarrning = false): string {
  const value = env(key) || defaultValue;
  if ((isNil(value) || value.length === 0) && !disableWarrning) {
    // eslint-disable-next-line no-console
    console.warn(`Configuration key not found or empty: ${key}`);
  }
  return value;
}

function getIntValueFromEnv(key: string, defaultValue: number, disableWarrning = false): number {
  const stringValue = getValueFromEnv(key, '', disableWarrning);
  if (isNil(stringValue)) {
    return defaultValue;
  }

  const intValue = parseInt(stringValue, 10);
  if (Number.isNaN(intValue)) {
    if (!disableWarrning) {
      // eslint-disable-next-line no-console
      console.warn(`Configuration ${key} is not a valid integer: ${stringValue}`);
    }
    return defaultValue;
  }

  return intValue;
}

function getArrayValuesFromEnv(key: string, defaultValue: string[], disableWarning = false): string[] {
  const stringValue = getValueFromEnv(key, '', disableWarning);
  if (isNil(stringValue)) {
    return defaultValue;
  }

  return stringValue.split(',');
}

function getBooleanValuesFromEnv(key: string, defaultValue: boolean, disableWarning = false): boolean {
  const stringValue = getValueFromEnv(key, '', disableWarning);
  if (isNil(stringValue)) {
    return defaultValue;
  }

  return stringValue.toLowerCase() === 'true';
}

export const config = {
  mockAuth: getValueFromEnv('TOGGLE_MOCK_AUTH', FEATURE_TOGGLE.OFF),
  hideMockAuth: getValueFromEnv('HIDE_MOCK_AUTH', FEATURE_TOGGLE.OFF),
  toggleReduxDevTool: getValueFromEnv('TOGGLE_REDUX_DEV_TOOL', FEATURE_TOGGLE.OFF),
  rendererUrl: getValueFromEnv('RENDERER_URL', ''),
  singpassNdiScriptUrl: getValueFromEnv('SINGPASS_NDI_SCRIPT', 'https://id.singpass.gov.sg/static/ndi_embedded_auth.js'),
  // lastBuiltAt is auto injected during build, no need to put manually
  lastBuiltAt: getValueFromEnv('LAST_BUILT_AT', '') as unknown as number,
  wogaaScriptUrl: getValueFromEnv('WOGAA_SCRIPT_URL', ''),
  refreshVerificationResultPageTimerInMs: getIntValueFromEnv('REFRESH_VERIFICATION_RESULT_PAGE_TIMER_IN_MS', 15 * 60 * 1000),
  awsRumConfig: {
    applicationId: getValueFromEnv('AWS_RUM_APPLICATION_ID', ''),
    applicationVersion: getValueFromEnv('AWS_RUM_APPLICATION_VERSION', ''),
    applicationRegion: getValueFromEnv('AWS_RUM_APPLICATION_REGION', 'ap-southeast-1'),
    guestRoleArn: getValueFromEnv('AWS_RUM_GUEST_ROLE_ARN', ''),
    identityPoolId: getValueFromEnv('AWS_RUM_IDENTITY_POOL_ID', ''),
    endpoint: getValueFromEnv('AWS_RUM_ENDPOINT', ''),
    telemetries: getArrayValuesFromEnv('AWS_RUM_TELEMETRIES', ['http', 'errors']),
    allowCookies: getBooleanValuesFromEnv('AWS_RUM_ALLOW_COOKIES', false),
    enableXRay: getBooleanValuesFromEnv('AWS_RUM_ENABLE_XRAY', false),
    sessionSampleRate: getIntValueFromEnv('AWS_RUM_SESSION_SAMPLE_RATE', 1),
  },
};
