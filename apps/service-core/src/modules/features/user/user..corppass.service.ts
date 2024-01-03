import { VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { isEmpty } from 'lodash';

import { transformBasicAgencies } from '../../../common/transformers/agency.transformer';
import { CorporateUserAuthUser } from '../../../typings/common';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { CorporateEntityService } from '../../entities/user/corporate/corporate.entity.service';

@Injectable()
export class CorppassUserService {
  private readonly logger = new Logger(CorppassUserService.name);

  constructor(private readonly agencyEntityService: AgencyEntityService, private readonly corporateEntityService: CorporateEntityService) {}

  public async getCorporateAgencyListByAccessibleAgency(user: CorporateUserAuthUser) {
    const { corporateUen, accessibleAgencies } = user;
    const canAccessAll = accessibleAgencies.map(({ code }) => code)?.includes('ALL');

    if (isEmpty(accessibleAgencies)) {
      return transformBasicAgencies([]);
    }

    const accessibleAgencyCodes = canAccessAll ? undefined : accessibleAgencies.map(({ code }) => code);

    const { userId: corporateId } = await this.corporateEntityService.retrieveCorporateByUen(corporateUen!, { toThrow: true });

    const agencies = await this.agencyEntityService.retrieveIssuingAgenciesWithStatusesByUserId(
      corporateId!,
      VIEWABLE_FILE_STATUSES,
      accessibleAgencyCodes,
    );
    return transformBasicAgencies(agencies);
  }
}
