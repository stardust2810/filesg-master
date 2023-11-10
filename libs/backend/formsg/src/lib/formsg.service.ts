import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import formSg from '@opengovsg/formsg-sdk';

import { FormSgDecryptionError, FormSgIdMismatchError, FormSgWebhookAuthenticationError } from './common/custom-exceptions';
import { DecryptParams } from './typings';

@Injectable()
export class FormSgService {
  private readonly logger = new Logger(FormSgService.name);

  public async decryptFormDataWithAttachments(formData: DecryptParams, formSecretKey: string) {
    const { crypto } = formSg();
    const submission = await crypto.decryptWithAttachments(formSecretKey, formData);

    if (!submission) {
      throw new FormSgDecryptionError(COMPONENT_ERROR_CODE.FORMSG_SERVICE);
    }

    return submission;
  }

  public async decryptFormData(formData: DecryptParams, formSecretKey: string) {
    const { crypto } = formSg();
    const submission = await crypto.decrypt(formSecretKey, formData);

    if (!submission) {
      throw new FormSgDecryptionError(COMPONENT_ERROR_CODE.FORMSG_SERVICE);
    }

    return submission;
  }

  public validateFormId(currentFormId: string, configFormId: string) {
    if (currentFormId !== configFormId) {
      const errorMsg = `formId ${currentFormId} is different from expected (${configFormId})`;

      throw new FormSgIdMismatchError(errorMsg, COMPONENT_ERROR_CODE.FORMSG_SERVICE);
    }
  }

  public authenticateWebhook(formSgSignature: string, webhookUrl: string) {
    const { webhooks } = formSg();

    try {
      webhooks.authenticate(formSgSignature, webhookUrl);
    } catch (error) {
      // authenticate throws WebhookAuthenticateError, which extends Error
      const errorMessage = (error as Error).message;
      throw new FormSgWebhookAuthenticationError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE);
    }
  }
}
