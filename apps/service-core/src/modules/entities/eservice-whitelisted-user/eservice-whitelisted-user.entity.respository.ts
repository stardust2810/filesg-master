import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { EserviceWhitelistedUser, EserviceWhitelistedUserUpdateModel } from '../../../entities/eservice-whitelisted-user';

@Injectable()
export class EserviceWhitelistedUserEntityRepository {
  public constructor(
    @InjectRepository(EserviceWhitelistedUser)
    private eserviceWhitelistedUser: Repository<EserviceWhitelistedUser>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(EserviceWhitelistedUser) : this.eserviceWhitelistedUser;
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async findEserviceWhitelistedUsersByAgencyCodeAndEserviceNameAndEmails(
    agencyCode: string,
    eserviceName: string,
    emails: string[],
  ) {
    return await this.getRepository()
      .createQueryBuilder('eserviceWhitelistedUser')
      .leftJoin('eserviceWhitelistedUser.eserviceUser', 'user')
      .leftJoin('user.eservices', 'eservices')
      .leftJoin('eservices.agency', 'agency')
      .where('eserviceWhitelistedUser.email IN (:...emails)', { emails })
      .andWhere('eservices.name = :eserviceName', { eserviceName })
      .andWhere('agency.code = :agencyCode', { agencyCode })
      .getMany();
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateEserviceWhitelistedUsersByEmails(
    emails: string[],
    dataToBeUpdated: EserviceWhitelistedUserUpdateModel,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder()
      .update(EserviceWhitelistedUser)
      .set(dataToBeUpdated)
      .where('email IN (:...emails)', { emails })
      .execute();
  }
}
