import { FEATURE_TOGGLE, numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

@Injectable()
export class NotificationConfigService {
  constructor(private configService: ConfigService<NotificationEnvironmentVariables>) {}

  get emailBlackListDurationInDays() {
    return this.configService.get('EMAIL_BLACK_LIST_DURATION_IN_DAYS', { infer: true })!;
  }

  get senderAddress() {
    return this.configService.get('EMAIL_NOTIFICATION_SENDER_ADDRESS', { infer: true })!;
  }

  get emailToggleSend() {
    return this.configService.get('EMAIL_TOGGLE_SEND', { infer: true })!;
  }

  get sgNotifyToggleSend() {
    return this.configService.get('SG_NOTIFY_TOGGLE_SEND', { infer: true })!;
  }

  get emailRetrievalPageUrl() {
    return this.configService.get('EMAIL_RETRIEVAL_PAGE_URL', { infer: true })!;
  }

  get sgNotifyRetrievalPageUrl() {
    return this.configService.get('SG_NOTIFY_RETRIEVAL_PAGE_URL', { infer: true })!;
  }
}

export class NotificationEnvironmentVariables {
  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  EMAIL_BLACK_LIST_DURATION_IN_DAYS: number;

  @Expose()
  @IsString()
  EMAIL_NOTIFICATION_SENDER_ADDRESS: string;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  EMAIL_TOGGLE_SEND: FEATURE_TOGGLE;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  SG_NOTIFY_TOGGLE_SEND: FEATURE_TOGGLE;

  @Expose()
  @IsString()
  EMAIL_RETRIEVAL_PAGE_URL: string;

  @Expose()
  @IsString()
  SG_NOTIFY_RETRIEVAL_PAGE_URL: string;
}
