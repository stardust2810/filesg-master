import { SESv2ClientConfig } from '@aws-sdk/client-sesv2';
import { ModuleMetadata } from '@nestjs/common';

export const SES_CLIENT = Symbol('SES_CLIENT');
export const SES_MODULE_OPTIONS = Symbol('SES_MODULE_OPTIONS');

export interface SesModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => SESv2ClientConfig | Promise<SESv2ClientConfig>;
  inject?: any[];
}

export interface SNSMessage {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  UnsubscribeURL: string;
}

export interface SESEmailNotificationMessage {
  notificationType: SES_NOTIFICATION_TYPE;
  mail: SESMailObject;
  bounce?: SESBounceObject;
  complaint?: SESComplaintObject;
  delivery?: SESDeliveryObject;
}

export enum SES_NOTIFICATION_TYPE {
  BOUNCE = 'Bounce',
  COMPLAINT = 'Complaint',
  DELIVERY = 'Delivery',
}

export interface SESMailObject {
  timestamp: string;
  messageId: string;
  source: string;
  sourceArn: string;
  sourceIp: string;
  sendingAccountId: string;
  destination: string[];
  headersTruncated?: boolean;
  headers?: EmailHeaderObject[];
  commonHeaders?: CommonHeadersObject;
  tags?: Record<string, string[]>;
}

interface EmailHeaderObject {
  name: string;
  value: string;
}

interface CommonHeadersObject {
  from: string[];
  date: string;
  to: string[];
  messageId: string;
  subject: string;
}

interface SESBounceObject {
  bounceType: 'Undetermined' | 'Permanent' | 'Transient';
  bounceSubType:
    | 'Undetermined'
    | 'General'
    | 'NoEmail'
    | 'Suppressed'
    | 'OnAccountSuppressionList'
    | 'MailboxFull'
    | 'MessageTooLarge'
    | 'ContentRejected'
    | 'AttachmentRejected';
  bouncedRecipients: BouncedRecipient[];
  timestamp: string;
  feedbackId: string;
}

interface ComplainedRecipient {
  emailAddress: string;
}

export interface BouncedRecipient extends ComplainedRecipient {
  action?: string;
  status?: string;
  diagnosticCode?: string;
}

interface SESComplaintObject {
  complainedRecipients: ComplainedRecipient[];
  timestamp: string;
  feedbackId: string;
  complaintSubType: 'OnAccountSuppressionList' | null;
  userAgent?: string;
  complaintFeedbackType: string;
  arrivalDate: string;
}

interface SESDeliveryObject {
  timestamp: string;
  processingTimeMillis: number;
  recipients: string;
  smtpResponse: string;
  reportingMTA: string;
  remoteMtaIp: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  base64Data: string;
}
