import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { FormSgBaseException, FormSgDecryptionError, FormSgWebhookAuthenticationError } from '@filesg/formsg';
import { Injectable, Logger } from '@nestjs/common';
import { SQSEvent, SQSRecord } from 'aws-lambda';

import { FormSgMessageProcessingError, MissingMessageAttributesError, NoHandlerError } from '../../../common/custom-exceptions';
import { FORMSG_FORM_TYPE } from '../../../const';
import { FormSgSqsRecord } from '../../../typings';
import { BatchIssuanceFormService } from './form-handler/batch-issuance-form.service';
import { RecallTransactionFormService } from './form-handler/recall-transaction-form.service';
import { SingleIssuanceFormService } from './form-handler/single-issuance-form.service';

@Injectable()
export class FormSgProcessorService {
  private readonly logger = new Logger(FormSgProcessorService.name);

  constructor(
    private singleIssuanceFormService: SingleIssuanceFormService,
    private batchIssuanceFormService: BatchIssuanceFormService,
    private recallTransactionFormService: RecallTransactionFormService,
  ) {}

  public async run(sqsEvent: SQSEvent) {
    this.logger.log(`Processing messages`);
    const { Records } = sqsEvent;
    const allSettledResults = await Promise.allSettled(Records.map((message) => this.messageHandler(message)));

    const retryableFailures: Array<{ messageId: string | undefined; errorMessage: string }> = [];
    allSettledResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        retryableFailures.push({
          messageId: Records[index].messageId,
          errorMessage: result.reason.message,
        });
      }
    });

    if (retryableFailures.length > 0) {
      const errorLog = `Retryable errors: ${JSON.stringify(retryableFailures)}`;
      throw new FormSgMessageProcessingError(errorLog, COMPONENT_ERROR_CODE.FORMSG_SERVICE);
    }

    this.logger.log(`Messages processed`);
  }

  protected async messageHandler(message: SQSRecord) {
    const { messageId } = message;
    const parsedSqsRecord: FormSgSqsRecord = message;

    this.logger.log(`Process message of id: ${messageId}`);
    try {
      // try parse message attributes & body
      // throw error if the parsed data don't match with the expected FormSG webhook data
      parsedSqsRecord.parsedBodyData = JSON.parse(message.body)?.data;
      parsedSqsRecord.parsedMessageAttributes = {
        formsgSignature: message.messageAttributes?.formsgSignature?.stringValue,
        type: message.messageAttributes?.type?.stringValue,
      };

      if (!parsedSqsRecord.parsedBodyData?.formId || !parsedSqsRecord.parsedBodyData?.submissionId) {
        throw new FormSgMessageProcessingError(
          `Expect FormSG Webhook data, but received ${message.body}`,
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        );
      }

      const { type, formsgSignature } = parsedSqsRecord.parsedMessageAttributes!;

      if (!formsgSignature || !type) {
        throw new MissingMessageAttributesError(
          `formsgSignatureVal - ${formsgSignature} | typeVal - ${type}`,
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        );
      }

      // handle formsg submission by issuance processing type
      switch (type) {
        case FORMSG_FORM_TYPE.SINGLE_ISSUANCE:
          await this.singleIssuanceFormService.singleIssuanceFormHandler(message);
          break;

        case FORMSG_FORM_TYPE.BATCH_ISSUANCE:
          await this.batchIssuanceFormService.batchIssuanceFormHandler(message);
          break;

        case FORMSG_FORM_TYPE.RECALL_TRANSACTION:
          await this.recallTransactionFormService.recallTransactionHandler(message);
          break;

        default:
          throw new NoHandlerError(type, COMPONENT_ERROR_CODE.FORMSG_SERVICE);
      }
    } catch (error: unknown) {
      await this.errorHandler(error, messageId);
    }
  }

  /**
   * Return
   */
  protected async errorHandler(error: any, messageId: string) {
    const errorMessage = error?.message ? error.message : JSON.stringify(error);
    this.logger.error(`[ErrorHandler] messageId: ${messageId} encountered error: ${errorMessage}`);

    if (error instanceof FormSgDecryptionError || error instanceof FormSgWebhookAuthenticationError) {
      return;
    }

    // if is not retryable, return instead of throwing
    if (error instanceof FormSgBaseException && !error.isRetryable) {
      return;
    }


    throw error;
  }
}
