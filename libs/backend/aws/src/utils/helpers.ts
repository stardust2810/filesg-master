import { LambdaClientConfig } from '@aws-sdk/client-lambda';
import { S3ClientConfig } from '@aws-sdk/client-s3';
import { SecretsManagerClientConfig } from '@aws-sdk/client-secrets-manager';
import { SESv2ClientConfig } from '@aws-sdk/client-sesv2';
import { SNSClientConfig } from '@aws-sdk/client-sns';
import { SQSClientConfig } from '@aws-sdk/client-sqs';
import { STSClientConfig } from '@aws-sdk/client-sts';

import { LOCALSTACK_ENDPOINT } from '../const';
import { LocalstackConfigOptions } from '../typings/common.typing';

type AwsClientConfig = S3ClientConfig | STSClientConfig | SQSClientConfig | LambdaClientConfig | SecretsManagerClientConfig;

function generateAwsClientConfigOptions(awsClientConfig: AwsClientConfig, isLocalstackOn = false, isS3Client = false): AwsClientConfig {
  const localstackConfigOptions: LocalstackConfigOptions = {
    endpoint: LOCALSTACK_ENDPOINT,
    forcePathStyle: isS3Client,
  };

  return {
    ...awsClientConfig,
    ...(isLocalstackOn && localstackConfigOptions),
  };
}

export function generateS3ClientConfigOptions(s3ClientConfig: S3ClientConfig, isLocalstackOn = false) {
  return generateAwsClientConfigOptions(s3ClientConfig, isLocalstackOn, true) as S3ClientConfig;
}

export function generateSqsClientConfigOptions(sqsClientConfig: SQSClientConfig, isLocalstackOn = false) {
  return generateAwsClientConfigOptions(sqsClientConfig, isLocalstackOn) as SQSClientConfig;
}

export function generateStsClientConfigOptions(stsClientConfig: STSClientConfig, isLocalstackOn = false) {
  return generateAwsClientConfigOptions(stsClientConfig, isLocalstackOn) as STSClientConfig;
}

export function generateSesClientConfigOptions(sesClientConfig: SESv2ClientConfig, isLocalstackOn = false) {
  return generateAwsClientConfigOptions(sesClientConfig, isLocalstackOn) as SESv2ClientConfig;
}

export function generateSnsClientConfigOptions(snsClientConfig: SNSClientConfig, isLocalstackOn = false) {
  return generateAwsClientConfigOptions(snsClientConfig, isLocalstackOn) as SNSClientConfig;
}

export function generateSmClientConfigOptions(smClientConfig: SecretsManagerClientConfig, isLocalstackOn = false) {
  return generateAwsClientConfigOptions(smClientConfig, isLocalstackOn) as SecretsManagerClientConfig;
}

export function generateLambdaClientConfigOptions(lambdaClientConfig: LambdaClientConfig, isLocalstackOn = false) {
  return generateAwsClientConfigOptions(lambdaClientConfig, isLocalstackOn) as LambdaClientConfig;
}
