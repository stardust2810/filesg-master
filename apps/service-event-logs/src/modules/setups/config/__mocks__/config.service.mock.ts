import { FEATURE_TOGGLE } from '@filesg/common';

export const mockFileSGConfigService = {
  systemConfig: {
    env: 'env',
  },
  notificationConfig: {
    emailToggleSend: FEATURE_TOGGLE.ON,
    senderAddress: 'mockEmailAddress',
  },
};
