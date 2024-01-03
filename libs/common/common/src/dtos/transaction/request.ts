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
  ACTIVITY_SORT_BY,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_REGEX,
  PATH_TRAVERSAL_REGEX,
  RECIPIENT_TYPE,
  REVOCATION_TYPE,
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
  queryParamArrayTransformer,
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
  @ApiProperty({ description: 'Name of the file to be issued with file extension', example: 'invoice.pdf' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsHash('sha256')
  @ApiProperty({
    description: 'Calculated SHA256 checksum of the file.',
    format: 'sha256',
    example: '185ed273fbb93e8f51693faaefb09081b16194906d622c9d0a497fb07a7a30fc',
  })
  checksum: string;

  @IsOptional()
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'FUTURE' })
  @ApiPropertyOptional({ example: '1995-01-01', description: 'The file will expire at the end of the specified date.' })
  expiry?: string;

  @IsOptional()
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'FUTURE' })
  @IsAfterDate('expiry')
  @ApiPropertyOptional({ example: '1995-01-01', description: 'The file will be deleted at the start of the specified date.' })
  deleteAt?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  isPasswordEncryptionRequired?: boolean;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @ApiPropertyOptional({
    required: false,
    description: 'Information agency intends to store certain data in a file.',
    example: { owner: 'John Doe' },
  })
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
    example: { 'file-one.pdf': 'c0Aswl@a', 'folder1/file-two.pdf': 'f0mAj$ga' },
  })
  agencyPassword?: AgencyPassword;
}

export class CreateRecipientRequest {
  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiProperty({ description: 'Full name of the recipient', example: 'John Doe' })
  name: string;

  @IsValidUin()
  @IsNotEmpty()
  @ApiProperty({ example: 'S7800000A' })
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
  @ApiPropertyOptional({ example: '1995-01-01 or 1995-01-00 or 1995-00-00' })
  dob?: string;

  @IsOptional()
  @IsEmail({})
  @IsASCIICharactersOnlyString()
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
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
  @ApiPropertyOptional({ example: '+6581234567' })
  contact?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @ApiPropertyOptional({
    description: 'Information agency intends to store certain user-related data in a file.',
    example: { isGuardian: true },
  })
  metadata?: Metadata;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: `Specifies whether the recipient is permitted to retrieve the pass using a non-SingPass route.` })
  isNonSingpassRetrievable?: boolean;
}

export class CreateRecipientV2Request {
  @IsOptional()
  @IsEnum(RECIPIENT_TYPE)
  @ApiPropertyOptional({ enum: RECIPIENT_TYPE })
  type?: RECIPIENT_TYPE;

  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiProperty({ example: 'John Doe' })
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
  @ApiPropertyOptional({ example: 'S7800000A' })
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
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
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
  @ApiPropertyOptional()
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
  @EnhancedValidateIf(
    ({ type, isNonSingpassRetrievable, dob }: CreateRecipientV2Request) =>
      (!type || type === RECIPIENT_TYPE.CITIZEN) && !isNonSingpassRetrievable && !!dob,
    [isEmpty],
    'dob must be empty when isNonSingpassRetrievable is false',
  )
  @ApiPropertyOptional({ example: '1995-01-01 or 1995-01-00 or 1995-00-00' })
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
    ({ type, isNonSingpassRetrievable, contact }: CreateRecipientV2Request) =>
      (!type || type === RECIPIENT_TYPE.CITIZEN) && !isNonSingpassRetrievable && !!contact,
    [isEmpty],
    'contact must be empty when isNonSingpassRetrievable is false.',
  )
  @EnhancedValidateIf(
    ({ type }: CreateRecipientV2Request) => !!type && type !== RECIPIENT_TYPE.CITIZEN,
    [isEmpty],
    'contact must be empty when recipient type is not citizen',
  )
  @ApiPropertyOptional({ example: '+658123456' })
  contact?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @ApiPropertyOptional({
    description: 'Information agency intends to store certain user-related data in a file.',
    example: { isGuardian: true },
  })
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
  @ApiPropertyOptional({ example: 'T09LL0001B' })
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
  @ApiPropertyOptional({ example: ['company.one@example.org', 'company.two@example.org'] })
  emails?: string[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Indicator flag to display Copy affix on issuance email subject' })
  isCopy?: boolean;
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
  @ApiProperty({ enum: ACTIVITY_SORT_BY })
  @IsNotEmpty()
  @IsEnum(ACTIVITY_SORT_BY)
  sortBy: ACTIVITY_SORT_BY;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(booleanTransformer('strict'), { toClassOnly: true })
  @IsBoolean({ message: 'asc has to be either "true" or "false"' })
  asc: boolean;

  @ApiProperty({ isArray: true, enum: VIEWABLE_ACTIVITY_TYPES })
  @Transform(queryParamArrayTransformer)
  @ArrayNotEmpty()
  @IsArray()
  @IsIn(VIEWABLE_ACTIVITY_TYPES, { each: true })
  types: typeof VIEWABLE_ACTIVITY_TYPES[number][];

  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @Transform(queryParamArrayTransformer)
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Matches(PATH_TRAVERSAL_REGEX, { message: 'Agency code should only contain alphabets', each: true })
  agencyCodes?: string[];
}

export class CustomAgencyMessage {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(stringArraySanitizerTransformer)
  @ApiProperty({
    type: String,
    isArray: true,
    description: 'Text that will be displayed on the activity page.',
    example: ['paragraph one', 'paragraph two'],
  })
  transaction: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(stringArraySanitizerTransformer)
  @ApiProperty({
    type: String,
    isArray: true,
    description: 'Text that will be displayed on the email received by the user.',
    example: ['paragraph one', 'paragraph two'],
  })
  email: string[];
}

export type TemplateMessageInput = Record<string, string>;
export class MessageTemplate {
  @IsNotEmpty()
  @IsString()
  @Matches(TRANSACTION_TEMPLATE_REGEX, {
    message: 'Property `templateId` must be provided that start with `transactioncustommessagetemplate-`',
  })
  @ApiProperty({
    description: 'Generated by FileSG during template onboarding.',
    example: 'transactioncustommessagetemplate-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
  })
  templateId: string;

  @IsOptional()
  @IsRecord()
  @IsNotEmpty()
  @Transform(recordSanitizerTransformer)
  @ApiProperty({ required: false, example: { paragraphOne: 'Content that needs to be displayed in para one' } })
  templateInput?: TemplateMessageInput;
}

export class NotificationMessage extends MessageTemplate {
  @IsNotEmpty()
  @IsEnum(NOTIFICATION_CHANNEL)
  @ApiProperty({ enum: NOTIFICATION_CHANNEL, example: 'EMAIL' })
  channel: NOTIFICATION_CHANNEL;

  @Matches(NOTIFICATION_TEMPLATE_REGEX, {
    message: 'Property `templateId` must be provided that start with `notificationmessagetemplate-`',
  })
  @ApiProperty({ example: 'notificationmessagetemplate-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx' })
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
  @ApiProperty({ description: 'Title of the transaction page and notification', example: 'Your document is ready for viewing' })
  name: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomAgencyMessage)
  @IsNotEmptyObject()
  @ApiPropertyOptional({ type: CustomAgencyMessage })
  customAgencyMessage: CustomAgencyMessage;
}

export class CreateTransactionRequest extends BaseCreateTransactionRequest {
  @IsNotEmpty()
  @IsEnum(TRANSACTION_TYPE)
  @ApiProperty({
    enum: TRANSACTION_TYPE,
    description: 'Use the value `upload_transfer` when creating transaction',
    example: 'upload_transfer',
  })
  type: TRANSACTION_TYPE;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipientRequest)
  @ApiProperty({ type: CreateRecipientRequest, isArray: true, description: 'List of recipients for whom the issuance is intended.' })
  recipients: CreateRecipientRequest[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  isAcknowledgementRequired?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Acknowledgement id to be provided if acknowledgement is required.',
    example: 'acknowledgementtemplate-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
  })
  acknowledgementTemplateUuid?: string;
}

export class CreateApplicationRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Generated by FileSG and given to agency during onboarding.', example: 'INV' })
  type: string;

  @IsOptional()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'The agency-generated ID enables traceability of transactions within FileSG.',
    example: 'TXN202311211453012345',
  })
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
  @ApiProperty({ enum: REVOCATION_TYPE, description: 'Only use `cancelled` value for this property', example: 'cancelled' })
  type: REVOCATION_TYPE.CANCELLED; // NOTE: only caters for cancellation, for now

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Transform(stringSanitizerTransformer)
  @ApiPropertyOptional({ description: 'reason of revoking the document', example: 'revoked as the pass has been cancelled' })
  reason?: string;

  @EitherOr('fileAssetUuid')
  @ValidateIf((req: RevocationRequest) => !(!req.transactionUuid && req.fileAssetUuids))
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    example: 'transaction-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
    description: 'Either provide fileAssetUuids or this field. If providing transactionUuid, do not provide fileAssetUuids.',
  })
  transactionUuid?: string;

  @EitherOr('transactionUuid')
  @ValidateIf((req: RevocationRequest) => !(!req.fileAssetUuids && req.transactionUuid))
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    type: String,
    isArray: true,
    example: ['fileasset-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx'],
    description: 'Either provide transactionUuid or this field. If providing fileAssetUuids, do not provide transactionUuid.',
  })
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
  @ApiProperty({ description: 'Title of the transaction page and notification', example: 'Your document is ready for viewing' })
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipientV2Request)
  @ApiProperty({ type: CreateRecipientV2Request, isArray: true })
  recipients: CreateRecipientV2Request[];

  @EnhancedValidateIf(
    ({ recipients }: BaseCreateTransactionV2Request) => recipients.map((recipient) => recipient.type).includes(RECIPIENT_TYPE.CORPORATE),
    [isEmpty],
    'isAcknowledgementRequired must be empty when any recipient is of type corporate',
  )
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isAcknowledgementRequired?: boolean;

  @EnhancedValidateIf(
    ({ recipients }: BaseCreateTransactionV2Request) => recipients.map((recipient) => recipient.type).includes(RECIPIENT_TYPE.CORPORATE),
    [isEmpty],
    'acknowledgementTemplateUuid must be empty when any recipient is of type corporate',
  )
  @EnhancedValidateIf(
    ({ isAcknowledgementRequired }: BaseCreateTransactionV2Request) => !isAcknowledgementRequired,
    [isEmpty],
    'acknowledgementTemplateUuid must be empty when isAcknowledgementRequired is false or undefined',
  )
  @EnhancedValidateIf(
    ({ isAcknowledgementRequired }: BaseCreateTransactionV2Request) => !!isAcknowledgementRequired,
    [isNotEmpty, isString],
    'acknowledgementTemplateUuid is required when isAcknowledgementRequired is true',
  )
  @ApiPropertyOptional({ example: 'acknowledgementtemplate-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx' })
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
