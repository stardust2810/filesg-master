import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class FormSgConfigService {
  constructor(private configService: ConfigService<FormSgEnvironmentVariables>) {}

  get formSgRecallIssuanceFormUrl() {
    return this.configService.get('FORMSG_RECALL_ISSUANCE_FORM_URL', { infer: true })!;
  }

  get formSgRecallIssuanceErrorScenariosDocUrl() {
    return this.configService.get('FORMSG_RECALL_ISSUANCE_ERROR_SCENARIOS_DOC_URL', { infer: true })!;
  }

  get formSgIssuanceErrorScenariosDocUrl() {
    return this.configService.get('FORMSG_ISSUANCE_ERROR_SCENARIOS_DOC_URL', { infer: true })!;
  }
}

export class FormSgEnvironmentVariables {
  @Expose()
  @IsString()
  FORMSG_RECALL_ISSUANCE_FORM_URL: string;

  @Expose()
  @IsString()
  FORMSG_RECALL_ISSUANCE_ERROR_SCENARIOS_DOC_URL: string;

  @Expose()
  @IsString()
  FORMSG_ISSUANCE_ERROR_SCENARIOS_DOC_URL: string;
}
