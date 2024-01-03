import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { createMimeMessage } from 'mimetext';
import { v4 as uuidv4 } from 'uuid';

import { AWSHttpException } from '../../common/filters/custom-exceptions';
import { LOG_OPERATION_NAME_PREFIX } from '../../const';
import { EmailAttachment, SES_CLIENT } from '../../typings/ses.typing';

@Injectable()
export class SesService {
  private readonly logger = new Logger(SesService.name);

  constructor(@Inject(SES_CLIENT) private readonly sesClient: SESv2Client) {}

  public async sendEmail(sender: string, receivers: string[], emailTitle: string, emailContent: string, attachments?: EmailAttachment[]) {
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.SES} Sending email to receivers: ${receivers.join(', ')}`;
    this.logger.log(taskMessage);

    const emailMessage = createMimeMessage();
    emailMessage.setSubject(emailTitle);
    emailMessage.setSender(sender, { type: 'From' });
    emailMessage.setTo(receivers);
    emailMessage.addMessage({
      contentType: 'text/html',
      data: emailContent,
    });

    // Setting X-Entity-Ref-ID header with a unique value prevents Gmail from threading different emails in same conversation
    // https://stackoverflow.com/questions/23434110/force-emails-not-to-be-grouped-into-conversations/25435722
    const uuid = uuidv4();
    emailMessage.setHeader('X-Entity-Ref-ID', uuid);

    if (attachments && attachments.length > 0) {
      attachments.forEach(({ filename, contentType, base64Data: data }) =>
        emailMessage.addAttachment({
          filename,
          contentType,
          data,
        }),
      );
    }

    try {
      const email = new SendEmailCommand({
        Content: {
          Raw: {
            Data: Buffer.from(emailMessage.asRaw()),
          },
        },
        FromEmailAddress: sender,
        Destination: {
          ToAddresses: receivers,
        },
      });

      const emailResponse = await this.sesClient.send(email);
      this.logger.log(`[Succeed] ${taskMessage}. Message Id: ${emailResponse.MessageId}`);
      return emailResponse;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.SES_SERVICE, errorMessage);
    }
  }
}
