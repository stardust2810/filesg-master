import { Credentials, Tag } from '@aws-sdk/client-sts';

export const mockRoleArn = 'mockRoleArn';
export const mockRoleSessionName = 'mockRoleSessionName';
export const mockDurationSeconds = 123;

export const mockTags: Tag[] = [
  { Key: 'mockKey1', Value: 'mockValue1' },
  { Key: 'mockKey2', Value: 'mockValue2' },
];

export const mockCredentials: Credentials = {
  AccessKeyId: 'mockAccessKeyId',
  SecretAccessKey: 'mockSecretAccessKey',
  SessionToken: 'mockSessionToken',
  Expiration: new Date(1234),
};
