import { getTypeOptions, IsMaskedUin, IsValidFileSGDate, IsValidSgMobile, NOTIFICATION_CHANNEL } from '@filesg/common';
import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { EVENT_LOGGING_EVENTS, FORMSG_PROCESS_FAIL_TYPE, FORMSG_TRANSACTION_FAIL_TYPE } from '../../constants/formsg.constant';

// =============================================================================
// Base
// =============================================================================
export class Application {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  externalRefId?: string;
}

export class RecipientActivity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsMaskedUin()
  @ApiProperty()
  maskedUin: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' })
  @ApiProperty({ example: '1995-01-01 or 1995-01-00 or 1995-00-00', required: false })
  dob?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsValidSgMobile()
  @ApiPropertyOptional()
  contact?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isNonSingpassRetrievable?: boolean;
}

export class AgencyFileAsset {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  uuid: string;

  @IsOptional()
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'ANY' })
  @ApiProperty({ example: '1995-01-01', required: false, description: 'The file will be deleted at the start of the specified date.' })
  deleteAt?: string;
}

export class Transaction {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RecipientActivity)
  @ApiProperty({ type: [RecipientActivity] })
  recipientActivities: RecipientActivity[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AgencyFileAsset)
  @ApiProperty({ type: [AgencyFileAsset] })
  agencyFileAssets: AgencyFileAsset[];
}

// =============================================================================
// FormSg Lambda Process
// =============================================================================
export class FormSgBaseEvent {
  @IsEnum(EVENT_LOGGING_EVENTS)
  type: EVENT_LOGGING_EVENTS;
}

export class FormSgProcessBaseEvent extends FormSgBaseEvent {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: string;
}

// Init
export class FormSgProcessInitEvent extends FormSgBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  @ApiProperty()
  ids: string[];

  @IsOptional()
  @IsString()
  @ApiProperty()
  batchId?: string;

  @IsNotEmpty()
  @IsValidFileSGDate({ includeTimestamp: true, allowedDate: 'PAST' })
  @ApiProperty()
  queueEventTimestamp: string;

  @IsNotEmpty()
  @IsValidFileSGDate({ includeTimestamp: true, allowedDate: 'PAST' })
  @ApiProperty()
  processorStartedTimestamp: string;
}

// Batch update
export class FormSgBatchProcessUpdateEvent extends FormSgProcessBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_UPDATE] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_UPDATE;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  requestorEmail: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  batchSize: number;
}

// Batch complete
export class FormSgBatchProcessCompleteEvent extends FormSgProcessBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_COMPLETE] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_COMPLETE;

  @IsNotEmpty()
  @IsValidFileSGDate({ includeTimestamp: true, allowedDate: 'PAST' })
  @ApiProperty()
  timestamp: string;
}

// Process success
export class FormSgProcessSuccessBaseEvent extends FormSgProcessBaseEvent {
  @IsNotEmpty()
  @IsValidFileSGDate({ includeTimestamp: true, allowedDate: 'PAST' })
  @ApiProperty()
  timestamp: string;

  @IsObject()
  @Type(() => Application)
  @ValidateNested()
  @ApiProperty()
  application: Application;

  @IsObject()
  @Type(() => Transaction)
  @ValidateNested()
  @ApiProperty()
  transaction: Transaction;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transactionUuid: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  notificationsToSendCount: number;
}

export class FormSgProcessSuccessEvent extends FormSgProcessSuccessBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  requestorEmail: string;
}

export class FormSgBatchProcessTransactionSuccessEvent extends FormSgProcessSuccessBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_SUCCESS] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_SUCCESS;
}

// Process failure
export class FormSgProcessFailureBase {
  @IsEnum(FORMSG_PROCESS_FAIL_TYPE)
  type: FORMSG_PROCESS_FAIL_TYPE;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  subType?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  reason: string;
}

export class FormSgProcessAuthDecryptFailure extends FormSgProcessFailureBase {
  @ApiProperty({ enum: [FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT] })
  override type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT;
}

export class FormSgBatchProcessValidationFailure extends FormSgProcessFailureBase {
  @ApiProperty({ enum: [FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION] })
  override type: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION;

  @IsOptional()
  @IsString()
  @ApiProperty()
  requestorEmail: string;
}

export class FormSgBatchProcessOthersFailure extends FormSgProcessFailureBase {
  @ApiProperty({ enum: [FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS] })
  override type: FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS;
}

/**
 * No validation for createTxn fields within CSV, as incorrect values will fail the sendEvent call.
 * Only Is<Type> & IsOptional to register field in whitelist
 */
export class FormSgProcessCreateTxnFailureRecipientActivity {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  maskedUin: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  dob?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  contact?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isNonSingpassRetrievable?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failSubType?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failedReason?: string;
}

export class FormSgProcessCreateTxnFailureAgencyFileAsset {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '1995-01-01', required: false, description: 'The file will be deleted at the start of the specified date.' })
  deleteAt?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failSubType?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failedReason?: string;
}

export class FormSgProcessCreateTxnFailureTransaction {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FormSgProcessCreateTxnFailureRecipientActivity)
  @ApiProperty({ type: [FormSgProcessCreateTxnFailureRecipientActivity] })
  recipientActivities: FormSgProcessCreateTxnFailureRecipientActivity[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FormSgProcessCreateTxnFailureAgencyFileAsset)
  @ApiProperty({ type: [FormSgProcessCreateTxnFailureAgencyFileAsset] })
  agencyFileAssets: FormSgProcessCreateTxnFailureAgencyFileAsset[];
}

export class FormSgProcessCreateTxnFailureBase extends FormSgProcessFailureBase {
  @ApiProperty({ enum: [FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN] })
  override type: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN;

  @IsObject()
  @Type(() => Application)
  @ValidateNested()
  @ApiProperty()
  application: Application;

  @IsObject()
  @Type(() => FormSgProcessCreateTxnFailureTransaction)
  @ValidateNested()
  @ApiProperty()
  transaction: FormSgProcessCreateTxnFailureTransaction;
}

export class FormSgProcessCreateTxnFailure extends FormSgProcessCreateTxnFailureBase {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  requestorEmail: string;
}

export class FormSgProcessBatchCreateTxnFailure extends FormSgProcessCreateTxnFailureBase {}

export class FormSgProcessFileUploadFailureRecipientActivity extends RecipientActivity {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failSubType?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failedReason?: string;
}

export class FormSgProcessFileUploadFailureAgencyFileAsset extends AgencyFileAsset {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failSubType?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  failedReason?: string;
}

export class FormSgProcessFileUploadFailureTransaction {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FormSgProcessFileUploadFailureRecipientActivity)
  @ApiProperty({ type: [FormSgProcessFileUploadFailureRecipientActivity] })
  recipientActivities: FormSgProcessFileUploadFailureRecipientActivity[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FormSgProcessFileUploadFailureAgencyFileAsset)
  @ApiProperty({ type: [FormSgProcessFileUploadFailureAgencyFileAsset] })
  agencyFileAssets: FormSgProcessFileUploadFailureAgencyFileAsset[];
}

export class FormSgProcessFileUploadFailureBase extends FormSgProcessFailureBase {
  @ApiProperty({ enum: [FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD] })
  override type: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD;

  @IsObject()
  @ValidateNested()
  @Type(() => Application)
  @ApiProperty()
  application: Application;

  @IsObject()
  @ValidateNested()
  @Type(() => FormSgProcessFileUploadFailureTransaction)
  @ApiProperty()
  transaction: FormSgProcessFileUploadFailureTransaction;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transactionUuid: string;
}

export class FormSgProcessFileUploadFailure extends FormSgProcessFileUploadFailureBase {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  requestorEmail: string;
}

export class FormSgProcessBatchFileUploadFailure extends FormSgProcessFileUploadFailureBase {}

export class FormSgProcessOthersFailure extends FormSgProcessFailureBase {
  @ApiProperty({ enum: [FORMSG_PROCESS_FAIL_TYPE.OTHERS] })
  override type: FORMSG_PROCESS_FAIL_TYPE.OTHERS;
}

@ApiExtraModels(FormSgProcessAuthDecryptFailure, FormSgProcessCreateTxnFailure, FormSgProcessFileUploadFailure, FormSgProcessOthersFailure)
export class FormSgProcessFailureEvent extends FormSgProcessBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE;

  @IsNotEmpty()
  @IsValidFileSGDate({ includeTimestamp: true, allowedDate: 'PAST' })
  @ApiProperty()
  timestamp: string;

  @IsObject()
  @ValidateNested()
  @Type(
    () => FormSgProcessFailureBase,
    getTypeOptions(
      [
        { name: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT, value: FormSgProcessAuthDecryptFailure },
        { name: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN, value: FormSgProcessCreateTxnFailure },
        { name: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD, value: FormSgProcessFileUploadFailure },
        { name: FORMSG_PROCESS_FAIL_TYPE.OTHERS, value: FormSgProcessOthersFailure },
      ],
      true,
    ),
  )
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(FormSgProcessAuthDecryptFailure) },
      { $ref: getSchemaPath(FormSgProcessCreateTxnFailure) },
      { $ref: getSchemaPath(FormSgProcessFileUploadFailure) },
      { $ref: getSchemaPath(FormSgProcessOthersFailure) },
    ],
  })
  failure: FormSgProcessAuthDecryptFailure | FormSgProcessCreateTxnFailure | FormSgProcessFileUploadFailure | FormSgProcessOthersFailure;
}

@ApiExtraModels(FormSgProcessBatchCreateTxnFailure, FormSgProcessBatchFileUploadFailure)
export class FormSgBatchProcessTransactionFailureEvent extends FormSgProcessBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_FAILURE] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_FAILURE;

  @IsNotEmpty()
  @IsValidFileSGDate({ includeTimestamp: true, allowedDate: 'PAST' })
  @ApiProperty()
  timestamp: string;

  @IsObject()
  @ValidateNested()
  @Type(
    () => FormSgProcessFailureBase,
    getTypeOptions(
      [
        { name: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN, value: FormSgProcessBatchCreateTxnFailure },
        { name: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD, value: FormSgProcessBatchFileUploadFailure },
      ],
      true,
    ),
  )
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(FormSgProcessBatchCreateTxnFailure) }, { $ref: getSchemaPath(FormSgProcessBatchFileUploadFailure) }],
  })
  failure: FormSgProcessBatchCreateTxnFailure | FormSgProcessBatchFileUploadFailure;
}

@ApiExtraModels(FormSgBatchProcessValidationFailure, FormSgBatchProcessOthersFailure)
export class FormSgBatchProcessFailureEvent extends FormSgProcessBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE;

  @IsNotEmpty()
  @IsValidFileSGDate({ includeTimestamp: true, allowedDate: 'PAST' })
  @ApiProperty()
  timestamp: string;

  @IsObject()
  @ValidateNested()
  @Type(
    () => FormSgProcessFailureBase,
    getTypeOptions(
      [
        { name: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION, value: FormSgBatchProcessValidationFailure },
        { name: FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS, value: FormSgBatchProcessOthersFailure },
      ],
      true,
    ),
  )
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(FormSgBatchProcessValidationFailure) }, { $ref: getSchemaPath(FormSgBatchProcessOthersFailure) }],
  })
  failure: FormSgBatchProcessValidationFailure | FormSgBatchProcessOthersFailure;
}

// =============================================================================
// FormSg Transaction
// =============================================================================
export class FormSgTransactionVirusScanFailureAgencyFileAsset {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  failedReason: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  failSubType: string;
}

export class FormSgTransactionBaseEvent extends FormSgBaseEvent {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transactionUuid: string;
}

export class FormSgTransactionSuccessEvent extends FormSgTransactionBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS;
}

export class FormSgTransactionFailureBase {
  @IsEnum(FORMSG_TRANSACTION_FAIL_TYPE)
  type: FORMSG_TRANSACTION_FAIL_TYPE;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  subType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  reason: string;
}

export class FormSgTransactionVirusScanFailure extends FormSgTransactionFailureBase {
  @ApiProperty({ enum: [FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN] })
  override type: FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FormSgTransactionVirusScanFailureAgencyFileAsset)
  @ApiProperty({ type: [FormSgTransactionVirusScanFailureAgencyFileAsset] })
  agencyFileAssets: FormSgTransactionVirusScanFailureAgencyFileAsset[];
}

export class FormSgTransactionOthersFailure extends FormSgTransactionFailureBase {
  @ApiProperty({ enum: [FORMSG_TRANSACTION_FAIL_TYPE.OTHERS] })
  override type: FORMSG_TRANSACTION_FAIL_TYPE.OTHERS;
}

@ApiExtraModels(FormSgTransactionVirusScanFailure, FormSgTransactionOthersFailure)
export class FormSgTransactionFailureEvent extends FormSgTransactionBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE;

  @IsObject()
  @ValidateNested()
  @Type(
    () => FormSgTransactionFailureBase,
    getTypeOptions(
      [
        { name: FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN, value: FormSgTransactionVirusScanFailure },
        { name: FORMSG_TRANSACTION_FAIL_TYPE.OTHERS, value: FormSgTransactionOthersFailure },
      ],
      true,
    ),
  )
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(FormSgTransactionVirusScanFailure) }, { $ref: getSchemaPath(FormSgTransactionOthersFailure) }],
  })
  failure: FormSgTransactionVirusScanFailure | FormSgTransactionOthersFailure;
}

// =============================================================================
// FormSg Notification Delivery
// =============================================================================
export class FormSgNotificationDeliveryBaseEvent extends FormSgBaseEvent {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transactionUuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  recipientActivityUuid: string;

  @IsEnum(NOTIFICATION_CHANNEL)
  @ApiProperty({ enum: NOTIFICATION_CHANNEL })
  channel: NOTIFICATION_CHANNEL;

  @IsNotEmpty()
  @IsMaskedUin()
  @ApiProperty()
  maskedUin: string;

  @ValidateIf((obj) => obj.channel === NOTIFICATION_CHANNEL.EMAIL)
  @IsNotEmpty()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;
}

export class FormSgRecipientNotificationDeliverySuccessEvent extends FormSgNotificationDeliveryBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS;
}

export class FormSgRecipientNotificationDeliveryFailureEvent extends FormSgNotificationDeliveryBaseEvent {
  @ApiProperty({ enum: [EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE] })
  override type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  failSubType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  failedReason: string;
}

// =============================================================================
// Main request
// =============================================================================
@ApiExtraModels(
  FormSgProcessInitEvent,
  FormSgProcessSuccessEvent,
  FormSgProcessFailureEvent,
  FormSgBatchProcessUpdateEvent,
  FormSgBatchProcessTransactionSuccessEvent,
  FormSgBatchProcessTransactionFailureEvent,
  FormSgBatchProcessCompleteEvent,
  FormSgBatchProcessFailureEvent,
  FormSgTransactionSuccessEvent,
  FormSgTransactionFailureEvent,
  FormSgRecipientNotificationDeliverySuccessEvent,
  FormSgRecipientNotificationDeliveryFailureEvent,
)
export class EventLoggingRequest {
  @IsObject()
  @ValidateNested()
  @Type(
    () => FormSgBaseEvent,
    getTypeOptions(
      [
        { name: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT, value: FormSgProcessInitEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS, value: FormSgProcessSuccessEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE, value: FormSgProcessFailureEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_UPDATE, value: FormSgBatchProcessUpdateEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_SUCCESS, value: FormSgBatchProcessTransactionSuccessEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_FAILURE, value: FormSgBatchProcessTransactionFailureEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_COMPLETE, value: FormSgBatchProcessCompleteEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE, value: FormSgBatchProcessFailureEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS, value: FormSgTransactionSuccessEvent },
        { name: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE, value: FormSgTransactionFailureEvent },
        {
          name: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
          value: FormSgRecipientNotificationDeliverySuccessEvent,
        },
        {
          name: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
          value: FormSgRecipientNotificationDeliveryFailureEvent,
        },
      ],
      true,
    ),
  )
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(FormSgProcessInitEvent) },
      { $ref: getSchemaPath(FormSgProcessSuccessEvent) },
      { $ref: getSchemaPath(FormSgProcessFailureEvent) },
      { $ref: getSchemaPath(FormSgBatchProcessUpdateEvent) },
      { $ref: getSchemaPath(FormSgBatchProcessTransactionSuccessEvent) },
      { $ref: getSchemaPath(FormSgBatchProcessTransactionFailureEvent) },
      { $ref: getSchemaPath(FormSgBatchProcessCompleteEvent) },
      { $ref: getSchemaPath(FormSgBatchProcessFailureEvent) },
      { $ref: getSchemaPath(FormSgTransactionSuccessEvent) },
      { $ref: getSchemaPath(FormSgTransactionFailureEvent) },
      { $ref: getSchemaPath(FormSgRecipientNotificationDeliverySuccessEvent) },
      { $ref: getSchemaPath(FormSgRecipientNotificationDeliveryFailureEvent) },
    ],
  })
  event:
    | FormSgProcessInitEvent
    | FormSgProcessSuccessEvent
    | FormSgProcessFailureEvent
    | FormSgBatchProcessUpdateEvent
    | FormSgBatchProcessTransactionSuccessEvent
    | FormSgBatchProcessTransactionFailureEvent
    | FormSgBatchProcessCompleteEvent
    | FormSgBatchProcessFailureEvent
    | FormSgTransactionSuccessEvent
    | FormSgTransactionFailureEvent
    | FormSgRecipientNotificationDeliverySuccessEvent
    | FormSgRecipientNotificationDeliveryFailureEvent;
}
