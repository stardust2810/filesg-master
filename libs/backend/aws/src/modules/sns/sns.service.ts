import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { AWSHttpException } from '../../common/filters/custom-exceptions';
import { SNS_CLIENT } from '../../typings/sns.typing';

@Injectable()
export class SnsService {
  private readonly logger = new Logger(SnsService.name);

  constructor(@Inject(SNS_CLIENT) private readonly snsClient: SNSClient) {}

  public async sendSms(message: string, mobileNumber: string) {
    const taskMessage = `Sending sms`;
    this.logger.log(taskMessage);
    this.logger.debug(`Mobile number: ${mobileNumber}`);

    try {
      const sms = new PublishCommand({
        PhoneNumber: mobileNumber,
        Message: message,
      });

      const response = await this.snsClient.send(sms);
      this.logger.log(`[Succeed] ${taskMessage}. Message Id: ${response.MessageId}`);

      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.SNS_SERVICE, errorMessage);
    }
  }
}
