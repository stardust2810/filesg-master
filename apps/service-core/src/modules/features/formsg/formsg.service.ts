import { InputValidationException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { EserviceUserEntityService } from '../../entities/user/eservice-user.entity.service';
@Injectable()
export class FormSgService {
  private readonly logger = new Logger(FormSgService.name);

  constructor(private readonly eserviceUserEntityService: EserviceUserEntityService) {}

  public async verifyRequestorEmail(requestorEmail: string) {
    const eserviceUser = await this.eserviceUserEntityService.retrieveEserviceUserByActiveWhitelistEmail(requestorEmail);

    if (!eserviceUser) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        `Agency user email provided ${requestorEmail} is not whitelisted`,
        `Eservice user not found with email: ${requestorEmail}`,
        EXCEPTION_ERROR_CODE.AGENCY_EMAIL_NOT_WHITELISTED,
      );
    }

    return eserviceUser;
  }
}
