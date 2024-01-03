import { JwtPayload } from '@filesg/backend-common';
import {
  AccessibleAgency,
  ActivatedFileStatus,
  ACTIVITY_TYPE,
  AgencyProgrammaticUserRole,
  AUDIT_EVENT_NAME,
  AUTH_TYPE,
  EserviceUserRole,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  OTP_CHANNEL,
  ROLE,
  SSO_ESERVICE,
  STATUS,
  TemplateContent,
  TemplateMessageInput,
  USER_TYPE,
} from '@filesg/common';
import { Request } from 'express';
import { Session } from 'express-session';
import { QueryRunner } from 'typeorm';

import { ActivityEncryptionDetails } from '../common/email-template/activity-emails/issuance.class';
import { TimestampableEntity } from '../entities/base-model';
import { Eservice } from '../entities/eservice';
import { NotificationMessageTemplate } from '../entities/notification-message-template';
import { EserviceUser, ProgrammaticUser } from '../entities/user';

export const MILLISECONDS = 1000;

// =============================================================================
// Consts
// =============================================================================
// Providers
export const SINGPASS_PROVIDER = 'SINGPASS_PROVIDER';
export const CORPPASS_PROVIDER = 'CORPPASS_PROVIDER';
export const MYINFO_PROVIDER = 'MYINFO_PROVIDER';

// Session
export const APPLICATION_REDIS_PREFIX = 'application:';

// =============================================================================
// Enums
// =============================================================================
// File Asset
export enum FILE_ASSET_TYPE {
  UPLOADED = 'uploaded',
  TRANSFERRED = 'transferred',
  SHARED = 'shared',
}

// Etc
export enum DB_QUERY_ERROR {
  DuplicateEntryError = 'ER_DUP_ENTRY',
}

export enum MCC_STATUS_CODE {
  'MYINFO RETRIEVAL SUCCESSFUL' = 'S000',
  'INVALID UIN LENGTH' = 'E000',
  'INTERNAL SERVER ERROR' = 'E001',
  'CIRIS IS UNAVAILABLE' = 'EC01',
  'PERSON DOES NOT EXIST IN CIRIS' = 'EC02',
  'MYINFO IS UNAVAILABLE' = 'EM01',
  'PERSON HAS INCOMPLETE PROFILE' = 'EM02',
  'INVALID SINGPASS LOGIN' = 'EM05',
}

// =============================================================================
// Typings
// =============================================================================
export type CreationAttributes<T extends TimestampableEntity, O extends keyof T, R extends keyof T> = Omit<
  Optional<Required<T>, O>,
  keyof TimestampableEntity | R
>;

export type CreateAttributesNoOmit<T extends TimestampableEntity, O extends keyof T> = Omit<
  Optional<Required<T>, O>,
  keyof TimestampableEntity
>;

export type CreationAttributesNoOptional<T extends TimestampableEntity, O extends keyof T> = Omit<T, keyof TimestampableEntity | O>;

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type AuthUser = CitizenAuthUser | CorporateUserAuthUser | ProgrammaticAuthUser;

// =============================================================================
// Session
// =============================================================================
export interface BaseAuthUser {
  // user related
  userId: number;
  userUuid: string;
  type: USER_TYPE;
  name: string | null;
  role: ROLE;
  isOnboarded: boolean;

  // session related
  lastLoginAt: Date | null;
  createdAt: Date | null;
  expiresAt: Date;
  sessionLengthInSecs: number;
  extendSessionWarningDurationInSecs: number;
  hasPerformedDocumentAction: boolean;
}

export interface CitizenAuthUser extends BaseAuthUser {
  type: USER_TYPE.CITIZEN;
  role: ROLE.CITIZEN;

  maskedUin: string;
  ssoEservice: SSO_ESERVICE | null;
  eserviceId?: number;
}

export interface CorporateUserAuthUser extends BaseAuthUser {
  type: USER_TYPE.CORPORATE_USER;
  role: ROLE.CORPORATE_USER;

  maskedUin: string;
  corporateUen: string;
  corporateName: string | null;
  corporateBaseUserId: number;
  corporateBaseUserUuid: string;
  accessibleAgencies: AccessibleAgency[];
}

export interface ProgrammaticAuthUser extends BaseAuthUser {
  type: USER_TYPE.PROGRAMMATIC;
  role: ROLE.PROGRAMMATIC_WRITE | ROLE.PROGRAMMATIC_READ | ROLE.SYSTEM | ROLE.PROGRAMMATIC_SYSTEM_INTEGRATION;
}

export type FileSGCitizenSession = Session & {
  user: CitizenAuthUser;
  csrfToken: string;
};

export type FileSGCorporateUserSession = Session & {
  user: CorporateUserAuthUser;
  csrfToken: string;
};

export type FileSGProgrammaticSession = Session & {
  user: ProgrammaticAuthUser;
  csrfToken: string;
};

export interface BaseRequestWithSession extends Request {
  queryRunner: QueryRunner;
}

export interface RequestWithCitizenSession extends BaseRequestWithSession {
  session: FileSGCitizenSession;
}

export interface RequestWithCorporateUserSession extends BaseRequestWithSession {
  session: FileSGCorporateUserSession;
}

export interface RequestWithProgrammaticSession extends BaseRequestWithSession {
  session: FileSGProgrammaticSession;
}

export interface RequestHeaderWithClient extends RequestWithProgrammaticSession {
  headers: {
    'x-client-id': string;
    'x-client-secret': string;
  };
}

// =============================================================================
// OTP
// =============================================================================
export type OtpDetails = NonSingpassRetrievalOtpDetails | ContactVerificationOtpDetails;

export interface BaseOtpDetails {
  otp: string;
  verificationAttemptCount: number;
  expireAt: Date;
  allowResendAt: Date | null;
  otpSentCount: number;
}

export type NonSingpassRetrievalOtpDetails = BaseOtpDetails;

export interface ContactVerificationOtpDetails extends BaseOtpDetails {
  contact: string;
}

export type GenerateOtpDetails = GenerateNonSingpassRetrievalOtpDetails | GenerateContactVerificationOtpDetails;

export interface BaseGenerateOtpDetails {
  otpDetails: OtpDetails;
  hasReachedOtpMaxResend: boolean;
  hasSentOtp: boolean;
}

export interface GenerateNonSingpassRetrievalOtpDetails extends BaseGenerateOtpDetails {
  otpDetails: NonSingpassRetrievalOtpDetails;
}

export interface GenerateContactVerificationOtpDetails extends BaseGenerateOtpDetails {
  otpDetails: ContactVerificationOtpDetails;
}

export type VerifyOtpDetails =
  | VerifyOtpMaxResendAndVerifyReachedDetails
  | VerifyNonSingpassRetrivalOtpDetails
  | VerifyContactVerificationOtpDetails;

export interface VerifyOtpMaxResendAndVerifyReachedDetails {
  hasReachedBothMaxResendAndVerify: true;
  otpDetails: null;
}

export interface VerifyNonSingpassRetrivalOtpDetails {
  hasReachedBothMaxResendAndVerify: false;
  otpDetails: NonSingpassRetrievalOtpDetails;
}

export interface VerifyContactVerificationOtpDetails {
  hasReachedBothMaxResendAndVerify: false;
  otpDetails: ContactVerificationOtpDetails;
}
// =============================================================================
// Etc
// =============================================================================
export interface DatabasePoolOptions {
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

export interface ActivityRecipientInfo {
  name: string;
  dob?: string;
  mobile?: string;
  email?: string;
  failedAttempts?: number;
  emails?: string[];
  isCopy?: boolean;
}

export interface AcknowledgementTemplateContent {
  content: TemplateContent;
}

export interface NonSingpass2FaJwtPayload extends JwtPayload {
  activityUuid: string;
}

export interface NonSingpass2FaRequest extends Request {
  channel?: OTP_CHANNEL;
  user: Omit<NonSingpass2FaJwtPayload, 'type'>;
}

export interface NonSingpassContentRetrievalPayload extends JwtPayload {
  sessionId: string;
  activityUuid: string;
  userId: number;
  userUuid: string;
}

export interface NonSingpassContentRetrievalRequest extends Request {
  user: Omit<NonSingpassContentRetrievalPayload, 'type'>;
}

export interface VerifyFileRetrievalPayload extends JwtPayload {
  userUuid: string;
  fileAssetUuid: string;
}

export interface VerifyFileRetrievalRequest extends Request {
  user: Omit<VerifyFileRetrievalPayload, 'type'>;
}

export interface TransactionCustomMessage {
  message: string[];
}

export interface DuplicateEserviceWhitelistedUsersDetails {
  email: string;
  status: STATUS;
}

export interface DuplicateEserviceWhitelistedUsersAgencyEserviceDetails {
  agencyCode: string;
  eserviceName: string;
  eserviceWhiteListedUsers: DuplicateEserviceWhitelistedUsersDetails[];
}

export interface InvalidEserviceWhitelistedUserEmailsDetails {
  notFound: string[];
  inactive: string[];
}

// =============================================================================
// Generate report typings
// =============================================================================
export interface ActivityReport {
  agencyRefNo?: string;
  activityUuid: string;
  activityIssuedOn: string;
  isAcknowledged: boolean;
  acknowledgedAt: string;
}

export interface FileReport {
  agencyRefNo?: string;
  activityUuid: string;
  activityIssuedOn: string;
  fileAssetUuid: string;
  fileName: string;
  fileStatus: string;
  expireAt: string;
  deleteAt: string;
  downloadCount: number;
}

export interface FileDownloadReport {
  fileAssetUuid: string;
  fileName: string;
  downloadTime: string;
}

export interface FileAccess {
  fileAssetUuid: string;
  userUuid: string;
  token: string;
}

export interface DocumentStatisticsReportEntry {
  agency: string;
  applicationType: string;
  issuedCount: number;
  revokedCount: number;
  accessedCount: number;
  downloadCount: number;
  printSaveCount: number;
  agencyDownloadCount: number;
  viewCount: number;
}

export interface DocumentStatisticsReportAgencyIssuedFileAssetRawQueryResult extends ActivatedFileStatusCount {
  agency: string;
  applicationType: string;
}

export type ActivatedFileStatusCount = Record<ActivatedFileStatus, string>;

interface BaseUserSessionAuditEventData {
  sessionId: string;
  userId: number;
}

export interface UserSsoSessionAuditEventData extends BaseUserSessionAuditEventData {
  authType: AUTH_TYPE.SINGPASS_SSO;
  ssoEservice: SSO_ESERVICE;
  corporateId?: never;
}

export interface UserNonSsoSessionAuditEventData extends BaseUserSessionAuditEventData {
  authType: AUTH_TYPE.SINGPASS | AUTH_TYPE.NON_SINGPASS | AUTH_TYPE.CORPPASS;
  ssoEservice?: never;
  corporateId?: never;
}

export interface UserCorporateSessionAuditEventData extends BaseUserSessionAuditEventData {
  authType: AUTH_TYPE.SINGPASS | AUTH_TYPE.NON_SINGPASS | AUTH_TYPE.CORPPASS;
  ssoEservice?: never;
  corporateId: number;
}

export type CitizenUserSessionAuditEventData = UserSsoSessionAuditEventData | UserNonSsoSessionAuditEventData;

export type UserSessionAuditEventData = {
  hasPerformedDocumentAction: boolean;
} & (UserSsoSessionAuditEventData | UserNonSsoSessionAuditEventData | UserCorporateSessionAuditEventData);

export type CorppassAuthInfoPayload = {
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  AuthInfo: JSON;
};

export type UserFilesAuditEventData = {
  fileAssetUuid: string;
  fileName: string;
  applicationType?: string;
  agency?: string;
  eservice?: string;
} & (UserSsoSessionAuditEventData | UserNonSsoSessionAuditEventData | UserCorporateSessionAuditEventData);

export type AgencyFilesDownloadAuditEvent = {
  fileAssetUuid: string;
  fileName: string;
  eservice: string;
  userUuid: string;
  isUserCopy: boolean;
  agency?: string;
  applicationType?: string;
};

export type AuditEventData = UserFilesAuditEventData | UserSessionAuditEventData | AgencyFilesDownloadAuditEvent;
// =============================================================================
// Entity Query Options
// =============================================================================
export type AuditEventQueryOptions = {
  eventName: AUDIT_EVENT_NAME;
  subEventName?: string;
};

// =============================================================================
// Notification
// =============================================================================
export type NotificationContent = EmailNotificationContent | SgNotifyNotificationContent;

export interface EmailNotificationContent extends BaseNotificationContent {
  customMessage: string[];
  agencyCode: string;
}

export interface SgNotifyNotificationContent extends BaseNotificationContent {
  templateId: string;
  templateInput: TemplateMessageInput | null;
}

interface BaseNotificationContent {
  encryptionDetailList?: ActivityEncryptionDetails[];
}

export type RecipientField = EmailRecipientField | SgNotifyRecipientField;

export interface EmailRecipientField {
  email: string;
}

export interface SgNotifyRecipientField {
  uin: string;
}

export interface PartialNotificationMessageInputCreation {
  notificationChannel: NOTIFICATION_CHANNEL;
  notificationMessageTemplate: NotificationMessageTemplate;
  templateVersion: number;
  templateInput: TemplateMessageInput | null;
}

export interface SgNotifyIssuanceArgs {
  recipientName: string;
  externalRefId: string;
  activityUuid: string;
}

export type NotificationTypeOptions = EmailNotificationOptions;

export interface EmailNotificationOptions {
  templateType: NOTIFICATION_TEMPLATE_TYPE;
  encryptionDetailsList?: ActivityEncryptionDetails[];
}

export interface CreateTransactionResponseLog {
  name: string;
  email?: string;
  activityUuid: string;
}

// =============================================================================
// Onboarding
// =============================================================================
export interface ProgrammaticUserInput {
  role: AgencyProgrammaticUserRole;
}

export interface EserviceUserInput {
  role: EserviceUserRole;
  emails: string[];
}

export interface UserToEserviceInsertableInput {
  eservice: Eservice;
  users: (ProgrammaticUser | EserviceUser)[];
}

export interface AgencyUsers {
  programmaticUsers: ProgrammaticUser[];
  eserviceUsers: EserviceUser[];
}

export interface RecallTransactionSuccessEmailActivityInfo {
  activityId: number;
  activityType: ACTIVITY_TYPE;
}
