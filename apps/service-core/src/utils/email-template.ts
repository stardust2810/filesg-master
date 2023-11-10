import { FileAsset } from '../entities/file-asset';

export enum EMAIL_TYPES {
  ISSUANCE = 'issuance',
  RESET_PASSWORD = 'resetPassword',
  VIRUS_SCAN_ERROR = 'virusOrScanError',
  CANCELLATION = 'cancellation',
  VERIFY_EMAIL = 'verifyEmail',
  EMAIL_DELIVERY_FAILED = 'emailDeliveryFailed',
  DELETION = 'deletion',
  RECALL = 'recall',
  FORMSG = 'formSg',
}

type ApplicationDetails = {
  agencyIcon: string;
  agencyCode: string;
  agencyFullName: string;
  transactionName: string;
  activityId: string;
  recipientName: string;
  customMessage?: string[];
  fileList?: FileAsset[];
  externalRefId?: string;
};

type BaseActivityEmailData = {
  retrievalPageUrl: string;
  baseUrl: string;
  imageAssetsUrl: string;
};

export type IssuanceData = {
  __typename?: EMAIL_TYPES.ISSUANCE;
  password?: string;
} & ApplicationDetails &
  BaseActivityEmailData;

export type CancellationData = {
  __typename?: EMAIL_TYPES.CANCELLATION;
  applicationTypeName: string;
  applicationTypeCode: string;
  fileList: FileAsset[];
} & ApplicationDetails &
  BaseActivityEmailData;

export type DeletionData = {
  __typename?: EMAIL_TYPES.DELETION;
  baseUrl: string;
  imageAssetsUrl: string;
} & ApplicationDetails &
  BaseActivityEmailData;
