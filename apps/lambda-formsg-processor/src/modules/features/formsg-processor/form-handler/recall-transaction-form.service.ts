import { COMPONENT_ERROR_CODE, CreateFormSgRecallTransactionRequest, RecallTransactionResponse } from '@filesg/common';
import { FormField, FormSgService } from '@filesg/formsg';
import { Inject, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';

import { FormSgNonRetryableRecallTransactionError, FormSgRecallTransactionError } from '../../../../common/custom-exceptions';
import {
  CORE_API_CLIENT_PROVIDER,
  FORMSG_RECALL_TRANSACTION_FORM_SECRET_NAME,
  RECALL_TRANSACTION_PATH,
  SECRET_MANAGER_FSG_APP_PREFIX,
} from '../../../../const';
import { RECALL_TRANSACTION_FORM_FIELD, RECALL_TRANSACTION_QUESTION_FIELD_MAP } from '../../../../const/formsg-question-field-map';
import { FormSgSqsRecord, RecallTransactionFormData } from '../../../../typings';
import { formUtils } from '../../../../utils';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { SmService } from '../../aws/sm.service';

@Injectable()
export class RecallTransactionFormService {
  private readonly logger = new Logger(RecallTransactionFormService.name);
  private formUtitlsWithInjects;
  private getRecallTransactionFormResponse;

  constructor(
    private readonly fileSgConfigService: FileSGConfigService,
    private readonly smService: SmService,
    private readonly formSgService: FormSgService,
    @Inject(CORE_API_CLIENT_PROVIDER)
    private readonly coreServiceClient: AxiosInstance,
  ) {
    this.formUtitlsWithInjects = formUtils(
      this.fileSgConfigService.formSGConfig.formSgRecallTransactionFormId,
      RECALL_TRANSACTION_QUESTION_FIELD_MAP,
    );
    this.getRecallTransactionFormResponse = this.formUtitlsWithInjects.getFormResponse;
  }

  public async recallTransactionHandler(queueEventRecord: FormSgSqsRecord) {
    const formData = queueEventRecord.parsedBodyData!;
    const { submissionId, formId } = formData;

    const taskMessage = `Creating FormSG recall transaction for form submission id: ${submissionId}`;
    this.logger.log(taskMessage);

    const { env } = this.fileSgConfigService.systemConfig;
    const { formSgRecallTransactionFormId, formSgRecallTransactionWebhookUrl } = this.fileSgConfigService.formSGConfig;

    const { formsgSignature } = queueEventRecord.parsedMessageAttributes!;

    // validate form id & auth webhook
    this.formSgService.validateFormId(formId, formSgRecallTransactionFormId);

    this.formSgService.authenticateWebhook(formsgSignature!, formSgRecallTransactionWebhookUrl);

    const formSecretKey = `${SECRET_MANAGER_FSG_APP_PREFIX}/${env}/${FORMSG_RECALL_TRANSACTION_FORM_SECRET_NAME}`;
    const formSgRecallTransactionFormSecret = await this.smService.getSecretValue(formSecretKey);

    // transform message to formsg recall transaction request
    const formContent = await this.formSgService.decryptFormData(formData, formSgRecallTransactionFormSecret);
    const { responses: formResponses } = formContent;

    const recallTransactionData = this.processFormData(formResponses);
    const recallTransactionRequestData = plainToClass(RecallTransactionFormData, recallTransactionData);

    await this.recallTransaction(recallTransactionRequestData);
    this.logger.log(`[Success] ${taskMessage}`);
  }

  protected processFormData(responses: FormField[]) {
    return {
      requestorEmail: this.getRecallTransactionFormResponse(responses, RECALL_TRANSACTION_FORM_FIELD.AGENCY_OFFICER_EMAIL)!,
      transactionUuid: this.getRecallTransactionFormResponse(responses, RECALL_TRANSACTION_FORM_FIELD.TRANSACTION_UUID)!,
    };
  }

  protected async recallTransaction(recallTransactionData: RecallTransactionFormData): Promise<void> {
    const { requestorEmail, transactionUuid } = recallTransactionData;

    const taskMessage = `Calling service-core - recalling transaction: ${transactionUuid}`;
    this.logger.log(taskMessage);

    try {
      await this.coreServiceClient.post<{ data: RecallTransactionResponse }, any, CreateFormSgRecallTransactionRequest>(
        `${RECALL_TRANSACTION_PATH}/${transactionUuid}`,
        { requestorEmail },
      );

      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error: any) {
      this.logger.warn(`[Failed] ${taskMessage}`);

      let errorMessage = error?.message ? error.message : JSON.stringify(error);

      if (axios.isAxiosError(error)) {
        // Handle the error return from the server responded with a status code
        const { response: errorResponse } = error;

        if (errorResponse && errorResponse.status >= 400 && errorResponse.status < 500) {
          errorMessage = JSON.stringify(errorResponse.data);
          this.logger.warn(`Recall transaction error encountered: ${errorMessage}`);
          throw new FormSgNonRetryableRecallTransactionError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE);
        }
      }

      // Handle the error when the request was made but no response was received
      // or any other error
      throw new FormSgRecallTransactionError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE);
    }
  }
}
