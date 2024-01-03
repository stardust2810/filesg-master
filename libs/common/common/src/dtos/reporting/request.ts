import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEmail, isEmpty, IsNotEmpty, isNotEmpty, IsOptional, IsString, isString } from 'class-validator';

import { isValidFileSGDate } from '../../utils';
import { IsAfterDate, IsASCIICharactersOnlyString, IsWithinDateRange } from '../../validators';
import { EnhancedValidateIf, IsNullable } from '../../validators';
import { DateStringRange } from '../common';

const MAX_EMAIL_RECIPIENT_COUNT = 10; // PFS

export class EmailRecipients {
  @IsArray()
  @ArrayMaxSize(MAX_EMAIL_RECIPIENT_COUNT)
  @IsEmail({}, { each: true })
  @IsASCIICharactersOnlyString({ each: true })
  to: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_EMAIL_RECIPIENT_COUNT)
  @IsEmail({}, { each: true })
  @IsASCIICharactersOnlyString({ each: true })
  cc?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_EMAIL_RECIPIENT_COUNT)
  @IsEmail({}, { each: true })
  @IsASCIICharactersOnlyString({ each: true })
  bcc?: string[];
}

export class TransactionReportRequest extends DateStringRange {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  agencyCode: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  eserviceCode?: string;
}

export class FileSgStatisticsReportRequest extends DateStringRange {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_EMAIL_RECIPIENT_COUNT)
  @IsEmail({}, { each: true })
  @IsASCIICharactersOnlyString({ each: true })
  emails?: string[];
}

export class FileSgUserActionsReportRequest extends DateStringRange {}

export class IssuanceQueryRequest {
  @IsOptional()
  @IsString()
  @ApiProperty()
  externalRefId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  activityUuid?: string;

  //activity recipientInfo
  @IsOptional()
  @IsString()
  @ApiProperty()
  recipientName?: string;

  //activity recipientInfo
  @IsOptional()
  @IsString()
  @ApiProperty()
  recipientEmail?: string;

  //agencyCode
  @IsNullable()
  @EnhancedValidateIf(
    (obj) => obj.recipientName || obj.recipientEmail,
    [isString, isNotEmpty],
    'agencyCode must be defined when either recipientName and recipientEmail is not empty',
  )
  @EnhancedValidateIf(
    (obj) => !obj.recipientName && !obj.recipientEmail,
    [isEmpty],
    'agencyCode must not be defined when both recipientName and recipientEmail is empty',
  )
  @ApiProperty()
  agencyCode: string;

  //startDateString
  @IsNullable()
  @EnhancedValidateIf(
    (obj) => obj.recipientName || obj.recipientEmail,
    [isNotEmpty, isValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'PAST' })],
    'startDateString must be defined as a valid date when either recipientName and recipientEmail is not empty',
  )
  @EnhancedValidateIf(
    (obj) => !obj.recipientName && !obj.recipientEmail,
    [isEmpty],
    'startDateString must not be defined when both recipientName and recipientEmail is empty',
  )
  @ApiProperty({ example: '1995-01-01' })
  startDateString: string;

  //endDateString
  @IsNullable()
  @EnhancedValidateIf(
    (obj) => obj.recipientName || obj.recipientEmail,
    [isNotEmpty, isValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'ANY' })],
    'endDateString must be defined as a valid date when either recipientName and recipientEmail is not empty',
  )
  @EnhancedValidateIf(
    (obj) => !obj.recipientName && !obj.recipientEmail,
    [isEmpty],
    'endDateString must not be defined when both recipientName and recipientEmail is empty',
  )
  @IsAfterDate('startDateString', true)
  @ApiProperty({ example: '1995-01-01' })
  @IsWithinDateRange('startDateString', 3, 'month')
  endDateString: string;
}
