import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, InsertResult } from 'typeorm';

import { EserviceUser, EserviceUserCreationModel } from '../../../entities/user';
import { generateEntityUUID } from '../../../utils/helpers';
import { EserviceUserEntityRepository } from './eservice-user.entity.repository';

@Injectable()
export class EserviceUserEntityService {
  private logger = new Logger(EserviceUserEntityService.name);

  constructor(private readonly eserviceUserEntityRepository: EserviceUserEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildEserviceUser(eserviceUserModel: EserviceUserCreationModel) {
    return this.eserviceUserEntityRepository.getRepository().create({
      uuid: generateEntityUUID(EserviceUser.name),
      ...eserviceUserModel,
    });
  }


  public async insertEserviceUsers(eserviceUserModels: EserviceUserCreationModel[], entityManager?: EntityManager): Promise<InsertResult> {
    const eserviceUsers = eserviceUserModels.map((model) => this.buildEserviceUser(model));
    return await this.eserviceUserEntityRepository.getRepository(entityManager).insert(eserviceUsers);
  }

  public async saveEserviceUsers(eserviceUserModels: EserviceUserCreationModel[], entityManager?: EntityManager): Promise<EserviceUser[]> {
    const eserviceUsers = eserviceUserModels.map((model) => this.buildEserviceUser(model));
    return await this.eserviceUserEntityRepository.getRepository(entityManager).save(eserviceUsers);
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveEserviceUserByActiveWhitelistEmail(email: string) {
    return await this.eserviceUserEntityRepository.findEserviceUserByActiveWhitelistEmail(email);
  }

  public async retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails(emails: string[]): Promise<EserviceUser[]> {
    return await this.eserviceUserEntityRepository.findEserviceUsersWithAgencyAndEserviceByWhitelistedEmails(emails);
  }

  public async retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName(
    agencyCode: string,
    eserviceName: string,
  ): Promise<EserviceUser> {
    const eserviceUser = await this.eserviceUserEntityRepository.findEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName(
      agencyCode,
      eserviceName,
    );

    if (!eserviceUser) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.ESERVICE_USER_ENTITY_SERVICE,
        'eserviceUser',
        'agencyCode and eserviceName',
        `${agencyCode} and ${eserviceName}`,
      );
    }

    return eserviceUser;
  }
}
