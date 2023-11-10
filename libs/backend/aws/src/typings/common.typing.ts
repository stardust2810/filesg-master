import { S3ClientConfig } from '@aws-sdk/client-s3';

export interface AwsS3Error {
  fileName: string;
  bucketName: string;
  awsErrorResponse: string;
}

export type LocalstackConfigOptions = Pick<S3ClientConfig, 'endpoint' | 'forcePathStyle'>;
