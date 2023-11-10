import { STATUS } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { EserviceUser } from '../../../entities/user';

@Injectable()
export class EserviceUserEntityRepository {
  public constructor(
    @InjectRepository(EserviceUser)
    private eserviceUserRepository: Repository<EserviceUser>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(EserviceUser) : this.eserviceUserRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findEserviceUserByActiveWhitelistEmail(email: string) {
    return await this.getRepository()
      .createQueryBuilder('eserviceUser')
      .leftJoinAndSelect('eserviceUser.whitelistedUsers', 'whitelistedUsers')
      .where('whitelistedUsers.email = :email', { email })
      .andWhere('whitelistedUsers.status = :status', { status: STATUS.ACTIVE })
      .getOne();
  }

  public async findEserviceUsersWithAgencyAndEserviceByWhitelistedEmails(emails: string[]) {
    return await this.getRepository()
      .createQueryBuilder('eserviceUser')
      .leftJoinAndSelect('eserviceUser.whitelistedUsers', 'whitelistedUsers')
      .leftJoinAndSelect('eserviceUser.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .where('whitelistedUsers.email IN (:...emails)', { emails })
      .getMany();
  }

  /**
   * Eservice user will only belong to 1 eservice
   */
  public async findEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName(agencyCode: string, eserviceName: string) {
    return await this.getRepository()
      .createQueryBuilder('eserviceUser')
      .leftJoin('eserviceUser.eservices', 'eservices')
      .leftJoin('eservices.agency', 'agency')
      .leftJoinAndSelect('eserviceUser.whitelistedUsers', 'whitelistedUsers')
      .where('eservices.name = :eserviceName', { eserviceName })
      .andWhere('agency.code = :agencyCode', { agencyCode })
      .getOne();
  }
}
