import { FEATURE_TOGGLE } from '@filesg/common';

export const mockFileSGConfigService = {
  systemConfig: { useLocalstack: FEATURE_TOGGLE.OFF },
  awsConfig: {
    region: 'mockRegion',
    stgCleanBucketName: 'mock-stg-clean-bucket',
    mainBucketName: 'mock-main-bucket',
    uploadMoveRoleArn: 'mock-upload-move-role-arn',
    assumeRoleSessionDuration: 900,
  },
};
