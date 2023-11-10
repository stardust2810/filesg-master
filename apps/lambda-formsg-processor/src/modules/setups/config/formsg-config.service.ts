import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class FormSGConfigService {
  constructor(private configService: ConfigService<FormSGEnvironmentVariables>) {}

  get formSgSingleIssuanceFormId() {
    return this.configService.get('FORMSG_SINGLE_ISSUANCE_FORM_ID', { infer: true })!;
  }

  get formSgSingleIssuanceWebhookUrl() {
    return this.configService.get('FORMSG_SINGLE_ISSUANCE_WEBHOOK_URL', { infer: true })!;
  }

  get formSgBatchIssuanceFormId() {
    return this.configService.get('FORMSG_BATCH_ISSUANCE_FORM_ID', { infer: true })!;
  }

  get formSgBatchIssuanceWebhookUrl() {
    return this.configService.get('FORMSG_BATCH_ISSUANCE_WEBHOOK_URL', { infer: true })!;
  }

  get formSgRecallTransactionFormId() {
    return this.configService.get('FORMSG_RECALL_TRANSACTION_FORM_ID', { infer: true })!;
  }

  get formSgRecallTransactionWebhookUrl() {
    return this.configService.get('FORMSG_RECALL_TRANSACTION_WEBHOOK_URL', { infer: true })!;
  }
}

export class FormSGEnvironmentVariables {
  @Expose()
  @IsString()
  FORMSG_SINGLE_ISSUANCE_FORM_ID: string;

  @Expose()
  @IsString()
  FORMSG_SINGLE_ISSUANCE_WEBHOOK_URL: string;

  @Expose()
  @IsString()
  FORMSG_BATCH_ISSUANCE_FORM_ID: string;

  @Expose()
  @IsString()
  FORMSG_BATCH_ISSUANCE_WEBHOOK_URL: string;

  @Expose()
  @IsString()
  FORMSG_RECALL_TRANSACTION_FORM_ID: string;

  @Expose()
  @IsString()
  FORMSG_RECALL_TRANSACTION_WEBHOOK_URL: string;
}
