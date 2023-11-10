import { Injectable, Logger } from '@nestjs/common';

import { AgencyUserEntityRepository } from './agency-user.entity.repository';

@Injectable()
export class AgencyUserEntityService {
  private readonly logger = new Logger(AgencyUserEntityService.name);

  constructor(private readonly agencyUserEntityRepository: AgencyUserEntityRepository) {}
}
