import { Injectable, Logger } from '@nestjs/common';
import { differenceInDays } from 'date-fns';
import { EntityManager } from 'typeorm';

import { EmailBlackListEntityService } from '../../entities/email-black-list/email-black-list.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class EmailBlackListService {
  private readonly logger = new Logger(EmailBlackListService.name);

  constructor(
    private readonly emailBlackListEntityService: EmailBlackListEntityService,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  public async isEmailBlackListed(emailAddress: string, entityManager?: EntityManager): Promise<boolean> {
    const blackListedEmail = await this.emailBlackListEntityService.retrieveBlackListedEmail(emailAddress, { toThrow: false });

    if (!blackListedEmail) {
      return false;
    }

    if (
      differenceInDays(new Date(), blackListedEmail.createdAt) >= this.fileSGConfigService.notificationConfig.emailBlackListDurationInDays
    ) {
      await this.emailBlackListEntityService.deleteBlackListedEmail(emailAddress, entityManager);
      return false;
    }

    return true;
  }
}
