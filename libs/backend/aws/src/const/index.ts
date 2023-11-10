// =============================================================================
// Enums
// =============================================================================
export enum LOG_OPERATION_NAME_PREFIX {
  S3 = '[AWS S3]:',
  SQS = '[AWS SQS]:',
  STS = '[AWS STS]:',
  SES = '[AWS SES]:',
  SNS = '[AWS SNS]:',
  LAMBDA = '[AWS LAMBDA]:',
  SM = '[AWS SM]:',
}

// SQS Configs
export enum SQS_MESSAGE_ATTRIBUTE_NAMES {
  SENT_TIMESTAMP = 'SentTimestamp',
  APPROXIMATE_RECEIVE_COUNT = 'ApproximateReceiveCount',
}

// =============================================================================
// Consts
// =============================================================================
export const LOCALSTACK_ENDPOINT = 'http://localhost:4566';

// SQS Configs
export const SQS_WAIT_TIME_SECONDS = 20;

export const SQS_MESSAGE_REQUIRED_ATTRIBUTE_LIST = [
  SQS_MESSAGE_ATTRIBUTE_NAMES.SENT_TIMESTAMP,
  SQS_MESSAGE_ATTRIBUTE_NAMES.APPROXIMATE_RECEIVE_COUNT,
];
