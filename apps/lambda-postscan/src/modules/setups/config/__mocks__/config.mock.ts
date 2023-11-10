import { FEATURE_TOGGLE } from '@filesg/common';

export const mockFileSGConfigService = {
  systemConfig: { useLocalstack: FEATURE_TOGGLE.OFF },
  awsConfig: {
    region: 'mockRegion',
    s3StgBucket: 'mockStgBucketName',
    s3StgCleanBucket: 'mockStgCleanBucketName',
    sqsCoreEvents: 'mockCoreEventsUrl',
    scanMoveRoleArn: 'mockScanMoveRoleArn',
    assumeRoleSessionDuration: 1234,
  },
};
