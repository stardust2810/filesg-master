import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  arrayNotEmpty,
  ArrayUnique,
  IsArray,
  isArray,
  IsBoolean,
  isBoolean,
  IsEmail,
  isEmail,
  isEmpty,
  IsEnum,
  IsHash,
  IsIn,
  IsNotEmpty,
  isNotEmpty,
  IsNotEmptyObject,
  isNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  isString,
  Matches,
  NotEquals,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_REGEX,
  RECIPIENT_TYPE,
  REVOCATION_TYPE,
  SORT_BY,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_TEMPLATE_REGEX,
  TRANSACTION_TYPE,
  VIEWABLE_ACTIVITY_TYPES,
} from '../../constants/common';
import { AgencyPassword, Metadata } from '../../typings/common';
import {
  agencyPasswordPasswordValidation,
  booleanTransformer,
  isNotDuplicateAgencyPasswordFilePath,
  isUinfinValid,
  isValidAgencyPasswordFilePath,
  isValidFileSGDate,
  recordSanitizerTransformer,
  stringArraySanitizerTransformer,
  stringSanitizerTransformer,
} from '../../utils';
import {
  EitherOr,
  EnhancedValidateIf,
  IsAfterDate,
  IsASCIICharactersOnlyString,
  isASCIIString,
  isNull,
  IsNullable,
  IsRecord,
  IsValidFilename,
  IsValidFileSGDate,
  isValidSgMobile,
  IsValidUin,
} from '../../validators/index';
import { PaginationOptions } from '../common';

export const FILE_ENCRYPTION_MAX_PASSWORD_CHAR = 200;

export class AgencyFileUpload {
  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @IsValidFilename()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsHash('sha256')
  @ApiProperty({ description: 'Calculated SHA256 checksum of the file.' })
  checksum: string;

  @IsOptional()
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'FUTURE' })
  @ApiProperty({ example: '1995-01-01', required: false, description: 'The file will expire at the end of the specified date.' })
  expiry?: string;

  @IsOptional()
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'FUTURE' })
  @IsAfterDate('expiry')
  @ApiProperty({ example: '1995-01-01', required: false, description: 'The file will be deleted at the start of the specified date.' })
  deleteAt?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  isPasswordEncryptionRequired?: boolean;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @ApiProperty({ required: false, description: 'Information agency intends to store certain data in a file.' })
  metadata?: Metadata;

  // isNotEmptyObject has a different option argument, as compared to the rest of class-validator's validation functions. Wrapper arrow function to remove standard option argument
  @EnhancedValidateIf(
    (val) => val.isPasswordEncryptionRequired,
    [(val) => isNotEmptyObject(val)],
    'agencyPassword must not be empty, and must be a valid object, with the file path as the key and password as the value',
  )
  @EnhancedValidateIf((val) => val.isPasswordEncryptionRequired, [isValidAgencyPasswordFilePath], 'Invalid path to file given')
  @EnhancedValidateIf(
    (val) => val.isPasswordEncryptionRequired,
    [isNotDuplicateAgencyPasswordFilePath],
    'Paths to file must not be duplicates',
  )
  @EnhancedValidateIf(
    (val) => val.isPasswordEncryptionRequired,
    [(val) => agencyPasswordPasswordValidation(val, FILE_ENCRYPTION_MAX_PASSWORD_CHAR)],
    `Password must be a non-empty string, and must not exceed ${FILE_ENCRYPTION_MAX_PASSWORD_CHAR} characters`,
  )
  @EnhancedValidateIf(
    (val) => !val.isPasswordEncryptionRequired,
    [isEmpty],
    'agencyPassword must not be defined if isPasswordEncryptionRequired is not true',
  )
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'If the agency prefers to use their own password for encryption, they can set a password per file.',
  })
  agencyPassword?: AgencyPassword;
}

export class CreateRecipientRequest {
  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiProperty()
  name: string;

  @IsValidUin()
  @IsNotEmpty()
  @ApiProperty()
  uin: string;

  @EnhancedValidateIf(
    (req: CreateRecipientRequest) => !!req.dob,
    [isValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' })],
    'dob must less than or equal to current date, and in the format of (yyyy-mm-dd).',
  )
  @EnhancedValidateIf(
    (req: CreateRecipientRequest) => !!req.isNonSingpassRetrievable && !req.dob,
    [isNotEmpty],
    'dob is required when isNonSingpassRetrievable is true.',
  )
  @ApiProperty({ example: '1995-01-01 or 1995-01-00 or 1995-00-00', required: false })
  dob?: string;

  @IsOptional()
  @IsEmail({})
  @IsASCIICharactersOnlyString()
  @ApiProperty({ required: false })
  email?: string;

  @EnhancedValidateIf(
    (req: CreateRecipientRequest) => !!req.contact,
    [isValidSgMobile],
    'Input must be a valid Singapore mobile (e.g. +6581234567)',
  )
  @EnhancedValidateIf(
    (req: CreateRecipientRequest) => !!req.isNonSingpassRetrievable && !req.contact,
    [isNotEmpty],
    'contact is required when isNonSingpassRetrievable is true',
  )
  @ApiProperty({ required: false })
  contact?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @ApiProperty({ required: false, description: 'Information agency intends to store certain user-related data in a file.' })
  metadata?: Metadata;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  isNonSingpassRetrievable?: boolean;
}

export class CreateRecipientV2Request {
  @IsOptional()
  @IsEnum(RECIPIENT_TYPE)
  @ApiProperty({ enum: RECIPIENT_TYPE, required: false })
  type?: RECIPIENT_TYPE;

  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiProperty()
  name: string;

  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => !type || type === RECIPIENT_TYPE.CITIZEN,
    [isUinfinValid, isNotEmpty],
    'uin must be valid and not empty',
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => !!type && type !== RECIPIENT_TYPE.CITIZEN,
    [isEmpty],
    'uin must be empty when recipient type is not citizen',
  )
  @ApiProperty({ required: false })
  uin?: string;

  @EnhancedValidateIf(
    ({ type, email }: CreateRecipientV2Request) => (!type || type === RECIPIENT_TYPE.CITIZEN) && !!email,
    [(val) => isEmail(val), isASCIIString],
    'email must be valid and contains only ASCII characters',
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => !!type && type !== RECIPIENT_TYPE.CITIZEN,
    [isEmpty],
    'email must be empty when recipient type is not citizen',
  )
  @ApiProperty({ required: false })
  email?: string;

  @EnhancedValidateIf(
    ({ type, isNonSingpassRetrievable }: CreateRecipientV2Request) =>
      (!type || type === RECIPIENT_TYPE.CITIZEN) && isNonSingpassRetrievable !== undefined,
    [isBoolean],
    'isNonSingpassRetrievable must be a boolean',
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => !!type && type !== RECIPIENT_TYPE.CITIZEN,
    [isEmpty],
    'isNonSingpassRetrievable must be empty when recipient type is not citizen',
  )
  @ApiProperty({ type: Boolean, required: false })
  isNonSingpassRetrievable?: boolean;

  @EnhancedValidateIf(
    ({ type, isNonSingpassRetrievable, dob }: CreateRecipientV2Request) =>
      (!type || type === RECIPIENT_TYPE.CITIZEN) && !!isNonSingpassRetrievable && !!dob,
    [isValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' })],
    'dob must less than or equal to current date, and in the format of (yyyy-mm-dd).',
  )
  @EnhancedValidateIf(
    ({ type, isNonSingpassRetrievable, dob }: CreateRecipientV2Request) =>
      (!type || type === RECIPIENT_TYPE.CITIZEN) && !!isNonSingpassRetrievable && !dob,
    [isNotEmpty],
    'dob is required when isNonSingpassRetrievable is true.',
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => !!type && type !== RECIPIENT_TYPE.CITIZEN,
    [isEmpty],
    'dob must be empty when recipient type is not citizen',
  )
  @ApiProperty({ example: '1995-01-01 or 1995-01-00 or 1995-00-00', required: false })
  dob?: string;

  @EnhancedValidateIf(
    ({ type, isNonSingpassRetrievable, contact }: CreateRecipientV2Request) =>
      (!type || type === RECIPIENT_TYPE.CITIZEN) && !!isNonSingpassRetrievable && !!contact,
    [isValidSgMobile],
    'contact must be a valid Singapore mobile (e.g. +6581234567)',
  )
  @EnhancedValidateIf(
    ({ type, isNonSingpassRetrievable, contact }: CreateRecipientV2Request) =>
      (!type || type === RECIPIENT_TYPE.CITIZEN) && !!isNonSingpassRetrievable && !contact,
    [isNotEmpty],
    'contact is required when isNonSingpassRetrievable is true.',
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => !!type && type !== RECIPIENT_TYPE.CITIZEN,
    [isEmpty],
    'contact must be empty when recipient type is not citizen',
  )
  @ApiProperty({ required: false })
  contact?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @ApiProperty({ required: false, description: 'Information agency intends to store certain user-related data in a file.' })
  metadata?: Metadata;

  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => type === RECIPIENT_TYPE.CORPORATE,
    [isString, isNotEmpty],
    'uen must be valid and not empty',
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => type !== RECIPIENT_TYPE.CORPORATE,
    [isEmpty],
    'uen must be empty when recipient type is not corporate',
  )
  @ApiProperty()
  uen?: string;

  @EnhancedValidateIf(
    ({ type, emails }: CreateRecipientV2Request) => type === RECIPIENT_TYPE.CORPORATE && !!emails,
    [isArray, arrayNotEmpty],
    'emails must be a non empty array',
  )
  @EnhancedValidateIf(
    ({ type, emails }: CreateRecipientV2Request) => type === RECIPIENT_TYPE.CORPORATE && (emails ? emails.length > 0 : false),
    [(val) => isEmail(val), isASCIIString],
    'Each email input must be a valid email and contains only ASCII characters',
    { each: true },
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => type !== RECIPIENT_TYPE.CORPORATE,
    [isEmpty],
    'emails must be empty when recipient type is not corporate',
  )
  emails?: string[];
}

export class UpdateUserEmailForTransactionRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transactionId: string;

  @IsValidUin()
  @IsNotEmpty()
  @ApiProperty()
  uin: string;

  @IsNotEmpty()
  @IsEmail()
  @IsASCIICharactersOnlyString()
  @ApiProperty()
  email: string;
}

export class CompletedActivitiesRequestDto extends PaginationOptions {
  @ApiProperty({ enum: SORT_BY })
  @IsNotEmpty()
  @IsEnum(SORT_BY)
  sortBy: SORT_BY;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(booleanTransformer('strict'), { toClassOnly: true })
  @IsBoolean({ message: 'asc has to be either "true" or "false"' })
  asc: boolean;

  @ApiProperty({ isArray: true, enum: VIEWABLE_ACTIVITY_TYPES })
  @Transform(({ value }) => (value as string).split(','))
  @IsIn(VIEWABLE_ACTIVITY_TYPES, { each: true })
  @ArrayNotEmpty()
  types: typeof VIEWABLE_ACTIVITY_TYPES[number][];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agencyCode?: string;
}

export class CustomAgencyMessage {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(stringArraySanitizerTransformer)
  @ApiProperty({ type: String, isArray: true, description: 'Text that will be displayed on the activity page.' })
  transaction: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(stringArraySanitizerTransformer)
  @ApiProperty({ type: String, isArray: true, description: 'Text that will be displayed on the email received by the user.' })
  email: string[];
}

export type TemplateMessageInput = Record<string, string>;
export class MessageTemplate {
  @IsNotEmpty()
  @IsString()
  @Matches(TRANSACTION_TEMPLATE_REGEX, {
    message: 'Property `templateId` must be provided that start with `transactioncustommessagetemplate-`',
  })
  @ApiProperty()
  templateId: string;

  @IsOptional()
  @IsRecord()
  @IsNotEmpty()
  @Transform(recordSanitizerTransformer)
  @ApiProperty({ required: false })
  templateInput?: TemplateMessageInput;
}

export class NotificationMessage extends MessageTemplate {
  @IsNotEmpty()
  @IsEnum(NOTIFICATION_CHANNEL)
  @ApiProperty({ enum: NOTIFICATION_CHANNEL })
  channel: NOTIFICATION_CHANNEL;

  @Matches(NOTIFICATION_TEMPLATE_REGEX, {
    message: 'Property `templateId` must be provided that start with `notificationmessagetemplate-`',
  })
  override templateId: string;
}

export class CustomAgencyMessageMultipleNotification {
  @IsNotEmpty()
  @Type(() => MessageTemplate)
  @ValidateNested({ each: true })
  @ApiProperty({ type: MessageTemplate })
  transaction: MessageTemplate;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @ArrayUnique<NotificationMessage>(({ channel, templateId }) => channel || templateId)
  @Type(() => NotificationMessage)
  @ApiProperty({ type: NotificationMessage, isArray: true })
  notifications: NotificationMessage[];
}

// =============================================================================
// Transactions
// =============================================================================
class BaseCreateTransactionRequest {
  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiProperty()
  name: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomAgencyMessage)
  @ApiProperty({ type: CustomAgencyMessage, required: false })
  @IsNotEmptyObject()
  customAgencyMessage: CustomAgencyMessage;
}

export class CreateTransactionRequest extends BaseCreateTransactionRequest {
  @IsNotEmpty()
  @IsEnum(TRANSACTION_TYPE)
  @ApiProperty({ enum: TRANSACTION_TYPE, description: 'Use the value `upload_transfer` when creating transaction' })
  type: TRANSACTION_TYPE;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipientRequest)
  @ApiProperty({ type: CreateRecipientRequest, isArray: true, description: 'List of recipients for whom the issuance is intended.' })
  recipients: CreateRecipientRequest[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  isAcknowledgementRequired?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: false, description: 'Acknowledgement id to be provided if acknowledgement is required.' })
  acknowledgementTemplateUuid?: string;
}

export class CreateApplicationRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: string;

  @IsOptional()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @IsNotEmpty()
  @ApiProperty({ required: false, description: 'The agency-generated ID enables traceability of transactions within FileSG.' })
  externalRefId?: string;
}

export class CreateRevokeTransactionRequest extends BaseCreateTransactionRequest {}

export class CreateFileTransactionRequest {
  @IsNotEmpty()
  @Type(() => CreateTransactionRequest)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateTransactionRequest })
  transaction: CreateTransactionRequest;

  @IsNotEmpty()
  @Type(() => CreateApplicationRequest)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateApplicationRequest })
  application: CreateApplicationRequest;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => AgencyFileUpload)
  @ValidateNested({ each: true })
  @ApiProperty({ type: AgencyFileUpload, isArray: true })
  files: AgencyFileUpload[];
}

export class RevocationRequest {
  @IsIn([REVOCATION_TYPE.CANCELLED])
  @ApiProperty({ enum: REVOCATION_TYPE, description: 'Only use `cancelled` value for this property' })
  type: REVOCATION_TYPE.CANCELLED; // NOTE: only caters for cancellation, for now

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiProperty({ required: false })
  reason?: string;

  @EitherOr('fileAssetUuid')
  @ValidateIf((req: RevocationRequest) => !(!req.transactionUuid && req.fileAssetUuids))
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: false })
  transactionUuid?: string;

  @EitherOr('transactionUuid')
  @ValidateIf((req: RevocationRequest) => !(!req.fileAssetUuids && req.transactionUuid))
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: String, isArray: true })
  fileAssetUuids?: string[];
}

export class RevokeTransactionRequest {
  @IsNotEmpty()
  @Type(() => CreateRevokeTransactionRequest)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateRevokeTransactionRequest })
  transaction: CreateRevokeTransactionRequest;

  @IsNotEmpty()
  @Type(() => RevocationRequest)
  @ValidateNested({ each: true })
  @ApiProperty({ type: RevocationRequest })
  revocation: RevocationRequest;
}

/**
 * Creating transaction version 2 as standalone without extending
 * Pro: we can decommision old version without having split it out
 * con: data duplication.
 */
export class BaseCreateTransactionV2Request {
  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiProperty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipientV2Request)
  @ApiProperty({ type: CreateRecipientV2Request, isArray: true })
  recipients: CreateRecipientV2Request[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isAcknowledgementRequired?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  acknowledgementTemplateUuid?: string;
}

export class CreateTransactionV2Request extends BaseCreateTransactionV2Request {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomAgencyMessageMultipleNotification)
  @ApiProperty({ type: CustomAgencyMessageMultipleNotification })
  customAgencyMessage: CustomAgencyMessageMultipleNotification;

  @IsOptional()
  @IsEnum(TRANSACTION_CREATION_METHOD, { message: 'creationMethod must be one of the allowed values' })
  @NotEquals(TRANSACTION_CREATION_METHOD.SYSTEM)
  creationMethod?: TRANSACTION_CREATION_METHOD;

  @IsNotEmpty()
  @IsEnum(TRANSACTION_TYPE)
  @ApiProperty({ enum: TRANSACTION_TYPE })
  type: TRANSACTION_TYPE;
}

export class FormsgTransactionRequest extends BaseCreateTransactionV2Request {
  @IsArray()
  @IsString({ each: true })
  @Transform(stringArraySanitizerTransformer)
  @ApiProperty({ type: [String] })
  longCustomMessage: string[];

  // FIXME: No support for sg-notify on formsg issuance
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(stringArraySanitizerTransformer)
  @ApiPropertyOptional({ type: [String] })
  shortCustomMessage?: string[];
}

export class CreateFileTransactionV2Request {
  @IsNotEmpty()
  @Type(() => CreateTransactionV2Request)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateTransactionV2Request })
  transaction: CreateTransactionV2Request;

  @IsNotEmpty()
  @Type(() => CreateApplicationRequest)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateApplicationRequest })
  application: CreateApplicationRequest;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => AgencyFileUpload)
  @ValidateNested({ each: true })
  @ApiProperty({ type: AgencyFileUpload, isArray: true })
  files: AgencyFileUpload[];
}

export class CreateFormSgFileTransactionRequest {
  @IsNotEmpty()
  @Type(() => FormsgTransactionRequest)
  @ValidateNested({ each: true })
  @ApiProperty({ type: FormsgTransactionRequest })
  transaction: FormsgTransactionRequest;

  @IsNotEmpty()
  @Type(() => CreateApplicationRequest)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateApplicationRequest })
  application: CreateApplicationRequest;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => AgencyFileUpload)
  @ValidateNested({ each: true })
  @ApiProperty({ type: AgencyFileUpload, isArray: true })
  files: AgencyFileUpload[];

  @IsEmail()
  @IsASCIICharactersOnlyString()
  @ApiProperty()
  requestorEmail: string;
}

export class CreateFormSgRecallTransactionRequest {
  @IsEmail()
  @IsASCIICharactersOnlyString()
  @ApiProperty()
  requestorEmail: string;
}

export class RecallTransactionRequest {
  @IsOptional()
  @IsEnum(TRANSACTION_CREATION_METHOD, { message: 'creationMethod must be one of the allowed values' })
  @NotEquals(TRANSACTION_CREATION_METHOD.SYSTEM)
  creationMethod?: TRANSACTION_CREATION_METHOD;
}

// =============================================================================
// Activities
// =============================================================================
export class UpdateRecipientInfoRequest {
  @IsNullable()
  @IsEmail(undefined, { message: 'email must be an email or null' })
  @IsASCIICharactersOnlyString()
  @ApiProperty({
    example: 'email@domain.com | null',
    required: true,
    description: 'email or null value to remove',
    type: 'string',
    nullable: true,
  })
  email: string | null;

  @IsNullable()
  @IsString({ message: 'contact must be a valid SG mobile or null' })
  @EnhancedValidateIf(
    (val) => val.dob || val.dob === '',
    [isNotEmpty, isString, isValidSgMobile],
    'contact must be a valid Singapore mobile (e.g. +6581234567) when dob is not null',
  )
  @EnhancedValidateIf((val) => val.dob === null, [isNull], 'mobile number must be null when dob is null')
  @ApiProperty({
    example: '+6581234567 | null',
    required: true,
    description: 'valid SG mobile number or null to remove',
    type: 'string',
    nullable: true,
  })
  contact: string | null;

  @IsNullable()
  @IsString({ message: 'dob must be a valid date or null' })
  @EnhancedValidateIf(
    (val) => val.contact || val.contact === '',
    [isValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' }), isNotEmpty],
    'dob must be valid, less than or equal to current date, and in the format of (yyyy-mm-dd) when mobile number is not null',
  )
  @EnhancedValidateIf((val) => val.contact === null, [isNull], 'dob must be null when mobile number is null')
  @ApiProperty({
    example: '1995-01-01 | null',
    required: true,
    description: 'dob or null value to remove',
    type: 'string',
    nullable: true,
  })
  dob: string | null;
}
