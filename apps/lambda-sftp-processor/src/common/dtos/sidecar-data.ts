import {
  booleanTransformer,
  EnhancedValidateIf,
  IsAfterDate,
  IsASCIICharactersOnlyString,
  IsRecord,
  IsValidFilename,
  IsValidFileSGDate,
  isValidFileSGDate,
  isValidSgMobile,
  IsValidUin,
  Metadata,
  MIME_TYPE,
  NOTIFICATION_CHANNEL,
  stringToObjectTransformer,
  TRANSACTION_TYPE,
  transformToUndefinedIfEmpty,
} from '@filesg/common';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  isEmpty,
  IsEnum,
  IsHash,
  IsNotEmpty,
  isNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  isString,
  ValidateNested,
} from 'class-validator';

export class SidecarTransactionRecord {
  @IsString()
  @IsNotEmpty()
  public applicationType: string;

  @IsOptional()
  @IsString()
  @Transform(transformToUndefinedIfEmpty)
  public applicationExternalRefId?: string;

  @IsNotEmpty()
  @IsString()
  public transactionName: string;

  @IsNotEmpty()
  @IsEnum(TRANSACTION_TYPE)
  public transactionType: TRANSACTION_TYPE;

  @IsOptional()
  @IsString()
  @Transform(transformToUndefinedIfEmpty)
  public transactionMessageId: string;

  @IsOptional()
  @IsRecord()
  @Transform(transformToUndefinedIfEmpty)
  public transactionMessageInput?: Record<string, string>;

  @IsBoolean()
  @Transform(booleanTransformer('extended'))
  public isAcknowledgementRequired: boolean;

  @IsOptional()
  @IsString()
  @Transform(transformToUndefinedIfEmpty)
  public acknowledgementTemplateId?: string;

  @IsNotEmpty()
  @IsString()
  public clientId: string;

  @IsNotEmpty()
  @IsString()
  public clientSecret: string;
}

export class SidecarRecipientRecord {
  @IsNotEmpty()
  @IsValidUin()
  public uin: string;

  @IsNotEmpty()
  @IsString()
  public fullName: string;

  @IsNotEmpty()
  @IsEmail()
  @IsASCIICharactersOnlyString()
  public email: string;

  @EnhancedValidateIf(
    (val) => val.contact,
    [isValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' }), isNotEmpty],
    'dob must be a non-empty, valid, less than or equal to current date, and in the format of (yyyy-mm-dd) when contact is non-empty',
  )
  @EnhancedValidateIf((val) => !val.contact, [isEmpty], 'dob must not be defined if contact is empty')
  @Transform(transformToUndefinedIfEmpty)
  public dob?: string;

  @EnhancedValidateIf(
    (val) => val.dob,
    [isNotEmpty, isString, isValidSgMobile],
    'contact must be a non-empty, valid string when dob is non-empty',
  )
  @EnhancedValidateIf((val) => !val.dob, [isEmpty], 'contact must not be defined if dob is empty')
  @Transform(transformToUndefinedIfEmpty)
  public contact?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @Transform(stringToObjectTransformer)
  public metadata?: Metadata;
}

export class SidecarFileRecord {
  @IsValidFilename()
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsString()
  @IsHash('sha256')
  public checksum: string;

  @IsOptional()
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'FUTURE' })
  @Transform(transformToUndefinedIfEmpty)
  public expiry?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @Transform(stringToObjectTransformer)
  public metadata?: Metadata;

  @IsOptional()
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'FUTURE' })
  @IsAfterDate('expiry')
  @Transform(transformToUndefinedIfEmpty)
  public deleteAt?: string;

  @IsBoolean()
  @Transform(booleanTransformer('extended'))
  public isPasswordEncryptionRequired: boolean;

  // This is optional because it will only be added after detecting
  @IsOptional()
  @IsEnum(MIME_TYPE)
  public mimeType?: MIME_TYPE;
}

export class SidecarAgencyPasswordRecord {
  @IsNotEmpty()
  @IsString()
  public filePath: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
}

export class SidecarNotificationsRecord {
  @IsNotEmpty()
  @IsEnum(NOTIFICATION_CHANNEL)
  public channel: NOTIFICATION_CHANNEL;

  @IsNotEmpty()
  @IsString()
  public templateId: string;

  @IsNotEmpty()
  @IsRecord()
  public templateInput: Record<string, string>;
}

export class SidecarData {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  @ValidateNested({ each: true })
  @Type(() => SidecarTransactionRecord)
  public transactions: SidecarTransactionRecord[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SidecarRecipientRecord)
  public recipients: SidecarRecipientRecord[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SidecarFileRecord)
  public files: SidecarFileRecord[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SidecarNotificationsRecord)
  @ArrayUnique<SidecarNotificationsRecord>(({ channel, templateId }) => channel || templateId)
  public notifications: SidecarNotificationsRecord[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SidecarAgencyPasswordRecord)
  public agencyPassword: SidecarAgencyPasswordRecord[];
}
