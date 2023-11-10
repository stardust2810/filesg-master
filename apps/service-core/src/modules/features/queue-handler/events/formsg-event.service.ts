import {
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgIssuanceFailureMessage,
  FormSgIssuanceFailureMessageBasePayload,
  FormSgIssuanceSuccessMessage,
  isSuccessFormSgIssuance,
} from '@filesg/backend-common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { EmailService } from '../../notification/email.service';

@Injectable()
export class FormSgEventService {
  protected readonly logger = new Logger(FormSgEventService.name);

  constructor(
    @Inject(EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER) private readonly eventLogsServiceApiClient: AxiosInstance,
    private readonly emailService: EmailService,
  ) {}

  public async formSgIssuanceHandler(messageBody: FormSgIssuanceSuccessMessage | FormSgIssuanceFailureMessage) {
    const { issuanceId } = messageBody.payload;

    // No email to send
    if (!isSuccessFormSgIssuance(messageBody)) {
      const { failType } = messageBody.payload as FormSgIssuanceFailureMessageBasePayload;

      if (
        failType === FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT ||
        failType === FORMSG_PROCESS_FAIL_TYPE.OTHERS ||
        failType === FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS
      ) {
        return this.logger.error(`Not sending report to requestor because it is ${failType} error. Record/issuance id: ${issuanceId}`);
      }
    }

    // No transaction information, hence no CSV attachment
    if (
      !isSuccessFormSgIssuance(messageBody) &&
      (messageBody.payload as FormSgIssuanceFailureMessageBasePayload).failType === FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION
    ) {
      return await this.emailService.sendFormSgIssuanceReportToRequestor(messageBody);
    }

    const { contentType, reportFileName, reportDataInBase64 } = await this.getFormSgIssuanceReport(issuanceId);

    await this.emailService.sendFormSgIssuanceReportToRequestor(messageBody, [
      { filename: reportFileName, contentType, base64Data: reportDataInBase64 },
    ]);
  }

  protected async getFormSgIssuanceReport(issuanceId: string) {
    const response = await this.eventLogsServiceApiClient.get(`v1/report/formsg-issuance/${issuanceId}?excludeFailureDetails=true`, {
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    const contentType = response.headers['content-type'];
    const reportFileName = contentDisposition.split(';')[1].split('=')[1];
    const reportDataInBase64 = Buffer.from(response.data).toString('base64');

    return { contentType, reportFileName, reportDataInBase64 };
  }
}
