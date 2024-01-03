import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  Equals,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  INTEGRATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  PATH_TRAVERSAL_REGEX,
  ROLE,
  USER_TYPE,
} from '../../constants/common';
import { Base, ContentOnly, TemplateContent, TitleWithContent } from '../../typings/acknowledgement-template';
import { AgencyProgrammaticUserRole, AgencyUserOnboardingDetails, EserviceUserRole } from '../../typings/common';
import { getTypeOptions, stringSanitizerTransformer } from '../../utils';
import { IsASCIICharactersOnlyString, IsStringEndsWith } from '../../validators';

// =============================================================================
// Base
// =============================================================================
export class BaseAgencyUserOnboardingRequestDetails {
  @ApiProperty({ enum: [USER_TYPE.PROGRAMMATIC, USER_TYPE.ESERVICE] })
  type: USER_TYPE.PROGRAMMATIC | USER_TYPE.ESERVICE;

  @ApiProperty({ enum: [ROLE.PROGRAMMATIC_READ, ROLE.PROGRAMMATIC_WRITE, ROLE.FORMSG] })
  role: AgencyProgrammaticUserRole | EserviceUserRole;
}

export class ProgrammaticUserOnboardingRequestDetails extends BaseAgencyUserOnboardingRequestDetails {
  @Equals(USER_TYPE.PROGRAMMATIC)
  @ApiProperty()
  override type: USER_TYPE.PROGRAMMATIC;

  @IsIn([ROLE.PROGRAMMATIC_READ, ROLE.PROGRAMMATIC_WRITE, ROLE.PROGRAMMATIC_SYSTEM_INTEGRATION])
  @ApiProperty({ enum: [ROLE.PROGRAMMATIC_READ, ROLE.PROGRAMMATIC_WRITE, ROLE.PROGRAMMATIC_SYSTEM_INTEGRATION] })
  override role: AgencyProgrammaticUserRole;
}

export class EserviceUserOnboardingRequestDetails extends BaseAgencyUserOnboardingRequestDetails {
  @Equals(USER_TYPE.ESERVICE)
  @ApiProperty()
  override type: USER_TYPE.ESERVICE;

  @Equals(ROLE.FORMSG)
  @ApiProperty()
  override role: EserviceUserRole;

  @IsEmail(undefined, { each: true })
  @IsASCIICharactersOnlyString({ each: true })
  @IsStringEndsWith('.gov.sg', { each: true, message: 'Emails must be from .gov.sg domain' })
  @ArrayUnique()
  @ArrayNotEmpty()
  @ApiProperty({ type: [String] })
  emails: string[];
}

@ApiExtraModels(ContentOnly, TitleWithContent)
export class AgencyOnboardingEserviceAcknowledgementTemplateRequest {
  @IsString()
  @ApiProperty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(
    () => Base,
    getTypeOptions([
      { name: 'ContentOnly', value: ContentOnly },
      { name: 'TitleWithContent', value: TitleWithContent },
    ]),
  )
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(ContentOnly) }, { $ref: getSchemaPath(TitleWithContent) }],
    },
  })
  content: TemplateContent;
}

// =============================================================================
// Requests
// =============================================================================
export class AgencyOnboardingApplicationTypeRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;

  @IsEnum(NOTIFICATION_CHANNEL, { each: true })
  @ApiProperty({ enum: NOTIFICATION_CHANNEL })
  notificationChannels: NOTIFICATION_CHANNEL[];
}

export class BaseTemplateOnboardingRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(NOTIFICATION_TEMPLATE_TYPE)
  @ApiProperty({ enum: NOTIFICATION_TEMPLATE_TYPE })
  type: NOTIFICATION_TEMPLATE_TYPE;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ApiProperty({ type: [String] })
  template: string[];

  @IsOptional()
  @IsEnum([INTEGRATION_TYPE.FORMSG])
  @ApiPropertyOptional()
  integrationType?: INTEGRATION_TYPE.FORMSG;
}

export class TransactionTemplateOnboardingRequest extends BaseTemplateOnboardingRequest {}

export class NotificationTemplateOnboardingRequest extends BaseTemplateOnboardingRequest {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  externalTemplateId?: string;

  @IsEnum(NOTIFICATION_CHANNEL)
  @ApiProperty({ enum: NOTIFICATION_CHANNEL })
  notificationChannel: NOTIFICATION_CHANNEL;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(stringSanitizerTransformer)
  @ApiPropertyOptional()
  copyRecipientSubjectAffix?: string;
}

export class BaseTemplateUpdateRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uuid: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ApiProperty({ type: [String] })
  template: string[];
}

export class TransactionTemplateUpdateRequest extends BaseTemplateUpdateRequest {}

export class NotificationTemplateUpdateRequest extends BaseTemplateUpdateRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(stringSanitizerTransformer)
  @ApiPropertyOptional()
  copyRecipientSubjectAffix?: string;
}

export class AgencyOnboardingEserviceRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEmail(undefined, { each: true })
  @IsASCIICharactersOnlyString({ each: true })
  @ArrayUnique()
  @ApiProperty({ type: [String] })
  emails: string[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(
    () => BaseAgencyUserOnboardingRequestDetails,
    getTypeOptions(
      [
        { name: USER_TYPE.PROGRAMMATIC, value: ProgrammaticUserOnboardingRequestDetails },
        { name: USER_TYPE.ESERVICE, value: EserviceUserOnboardingRequestDetails },
      ],
      true,
    ),
  )
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(ProgrammaticUserOnboardingRequestDetails) },
        { $ref: getSchemaPath(EserviceUserOnboardingRequestDetails) },
      ],
    },
  })
  users: AgencyUserOnboardingDetails;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AgencyOnboardingApplicationTypeRequest)
  @ApiPropertyOptional({ type: [AgencyOnboardingApplicationTypeRequest] })
  applicationTypes?: AgencyOnboardingApplicationTypeRequest[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AgencyOnboardingEserviceAcknowledgementTemplateRequest)
  @ApiPropertyOptional({ type: [AgencyOnboardingEserviceAcknowledgementTemplateRequest] })
  acknowledgementTemplates?: AgencyOnboardingEserviceAcknowledgementTemplateRequest[];
}

export class AgencyOnboardingRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(stringSanitizerTransformer)
  agencyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Matches(PATH_TRAVERSAL_REGEX, { message: 'Agency code should only contain alphabets' })
  agencyCode: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  identityProofLocation?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AgencyOnboardingEserviceRequest)
  @ApiProperty({ type: [AgencyOnboardingEserviceRequest] })
  eservices: AgencyOnboardingEserviceRequest[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TransactionTemplateOnboardingRequest)
  @ApiPropertyOptional({ type: [TransactionTemplateOnboardingRequest] })
  transactionTemplates?: TransactionTemplateOnboardingRequest[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => NotificationTemplateOnboardingRequest)
  @ApiPropertyOptional({ type: [NotificationTemplateOnboardingRequest] })
  notificationTemplates?: NotificationTemplateOnboardingRequest[];
}

export class AddTransactionTemplatesRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TransactionTemplateOnboardingRequest)
  @ApiProperty({ type: [TransactionTemplateOnboardingRequest] })
  transactionTemplates: TransactionTemplateOnboardingRequest[];
}

export class UpdateTransactionTemplatesRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TransactionTemplateUpdateRequest)
  @ApiProperty({ type: [TransactionTemplateUpdateRequest] })
  transactionTemplates: TransactionTemplateUpdateRequest[];
}

export class AddNotificationTemplatesRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => NotificationTemplateOnboardingRequest)
  @ApiProperty({ type: [NotificationTemplateOnboardingRequest] })
  notificationTemplates: NotificationTemplateOnboardingRequest[];
}

export class UpdateNotificationTemplatesRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => NotificationTemplateUpdateRequest)
  @ApiProperty({ type: [NotificationTemplateUpdateRequest] })
  notificationTemplates: NotificationTemplateUpdateRequest[];
}

export class EserviceOnboardingRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AgencyOnboardingEserviceRequest)
  @ApiProperty({ type: [AgencyOnboardingEserviceRequest] })
  eservices: AgencyOnboardingEserviceRequest[];
}

export class EserviceAcknowledgementTemplateOnboardingEserviceRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AgencyOnboardingEserviceAcknowledgementTemplateRequest)
  @ApiProperty({ type: [AgencyOnboardingEserviceAcknowledgementTemplateRequest] })
  acknowledgementTemplates: AgencyOnboardingEserviceAcknowledgementTemplateRequest[];
}

export class EserviceAcknowledgementTemplateOnboardingRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EserviceAcknowledgementTemplateOnboardingEserviceRequest)
  @ApiProperty({ type: [EserviceAcknowledgementTemplateOnboardingEserviceRequest] })
  eservices: EserviceAcknowledgementTemplateOnboardingEserviceRequest[];
}

export class EserviceTransactionTemplateOnboardingRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EserviceAcknowledgementTemplateOnboardingEserviceRequest)
  @ApiProperty({ type: [EserviceAcknowledgementTemplateOnboardingEserviceRequest] })
  eservices: EserviceAcknowledgementTemplateOnboardingEserviceRequest[];
}

export class EserviceNotificationTemplateOnboardingRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EserviceAcknowledgementTemplateOnboardingEserviceRequest)
  @ApiProperty({ type: [EserviceAcknowledgementTemplateOnboardingEserviceRequest] })
  eservices: EserviceAcknowledgementTemplateOnboardingEserviceRequest[];
}

export class AgencyUsersOnboardingRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  eserviceName: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(
    () => BaseAgencyUserOnboardingRequestDetails,
    getTypeOptions(
      [
        { name: USER_TYPE.PROGRAMMATIC, value: ProgrammaticUserOnboardingRequestDetails },
        { name: USER_TYPE.ESERVICE, value: EserviceUserOnboardingRequestDetails },
      ],
      true,
    ),
  )
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(ProgrammaticUserOnboardingRequestDetails) },
        { $ref: getSchemaPath(EserviceUserOnboardingRequestDetails) },
      ],
    },
  })
  users: AgencyUserOnboardingDetails;
}

export class EserviceWhitelistedUsersOnboardingRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  agencyCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  eserviceName: string;

  @IsEmail(undefined, { each: true })
  @IsASCIICharactersOnlyString({ each: true })
  @IsStringEndsWith('.gov.sg', { each: true, message: 'Emails must be from .gov.sg domain' })
  @ArrayUnique()
  @ArrayNotEmpty()
  @ApiProperty({ type: [String] })
  emails: string[];
}
