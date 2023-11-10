import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class AwsConfigService {
  constructor(private configService: ConfigService<AwsEnvironmentVariables>) {}

  get region() {
    return this.configService.get('AWS_REGION', { infer: true })!;
  }

  get formSgTransactionEventLogsTableName() {
    return this.configService.get('FORMSG_TXN_EVENT_LOGS_DDB_TABLE_NAME', { infer: true })!;
  }

  get coreEventsQueueUrl() {
    return this.configService.get('AWS_SQS_CORE_EVENTS', { infer: true })!;
  }
}

export class AwsEnvironmentVariables {
  @Expose()
  @IsString()
  AWS_REGION: string;

  @Expose()
  @IsString()
  FORMSG_TXN_EVENT_LOGS_DDB_TABLE_NAME: string;

  @Expose()
  @IsString()
  AWS_SQS_CORE_EVENTS: string;
}
