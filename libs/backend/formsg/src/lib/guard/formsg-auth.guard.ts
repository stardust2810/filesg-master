import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

import { FormSgService } from '../formsg.service';

@Injectable()
export class FormSgAuthGuard implements CanActivate {
  private readonly logger = new Logger(FormSgAuthGuard.name);
  constructor(private readonly webhookUri: string, private readonly domainUrl: string, private readonly formSgService: FormSgService) {}

  canActivate(context: ExecutionContext): boolean {
    const contextHttp = context.switchToHttp();
    const req = contextHttp.getRequest<Request>();
    const { originalUrl } = req;

    if (originalUrl.startsWith(this.webhookUri)) {
      const formSgSignature = req.get('X-FormSG-Signature');

      if (!formSgSignature) {
        // FIXME: to change to custom exception
        throw new Error('Missing FormSG signature');
      }

      const webhookUrl = this.domainUrl + this.webhookUri;
      // FIXME: to trycatch throw handle thrown error
      this.formSgService.authenticateWebhook(formSgSignature, webhookUrl);
    }

    return true;
  }
}
