import { CI_ENVIRONMENT, ENVIRONMENT, FEATURE_TOGGLE, LOG_LEVEL } from '@filesg/common';

export const mockFileSGConfigService = {
  systemConfig: {
    env: CI_ENVIRONMENT.LOCAL,
    nodeEnv: ENVIRONMENT.PRODUCTION,
    logLevel: LOG_LEVEL.DEBUG,
    useLocalstack: FEATURE_TOGGLE.ON,
    coreServiceUrl: 'https://localhost:5000',
    transferServiceUrl: 'https://localhost:5001',
  },
  awsConfig: {
    region: 'ap-southeast-1',
    sqsSftpProcessor: 'mock-sqs-sftp-processor',
    s3SftpBucket: 'mock-sftp-bucket',
    sftpRoleArn: 'mock-sftp-role-arn',
    assumeRoleSessionDuration: 900,
  },
  sliftConfig: {
    sliftDir: 'mock-slift-dir',
  },
};
