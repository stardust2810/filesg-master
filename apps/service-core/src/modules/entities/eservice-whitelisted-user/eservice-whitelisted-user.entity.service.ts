import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { EserviceWhitelistedUserCreationModel, EserviceWhitelistedUserUpdateModel } from '../../../entities/eservice-whitelisted-user';
import { EserviceWhitelistedUserEntityRepository } from './eservice-whitelisted-user.entity.respository';

@Injectable()
export class EserviceWhitelistedUserEntityService {
  constructor(private readonly eserviceWhitelistedUserEntityRepository: EserviceWhitelistedUserEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildEserviceWhitelistedUser(eserviceWhitelistedUserCreationModel: EserviceWhitelistedUserCreationModel) {
    return this.eserviceWhitelistedUserEntityRepository.getRepository().create({
      ...eserviceWhitelistedUserCreationModel,
    });
  }

  public async insertEserviceWhitelistedUsers(
    eserviceWhitelistedUserCreationModels: EserviceWhitelistedUserCreationModel[],
    entityManager?: EntityManager,
  ) {
    const eserviceWhitelistedUsers = eserviceWhitelistedUserCreationModels.map((model) => this.buildEserviceWhitelistedUser(model));
    return await this.eserviceWhitelistedUserEntityRepository.getRepository(entityManager).insert(eserviceWhitelistedUsers);
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveEserviceWhitelistedUsersByAgencyCodeAndEserviceNameAndEmails(
    agencyCode: string,
    eserviceName: string,
    emails: string[],
  ) {
    return await this.eserviceWhitelistedUserEntityRepository.findEserviceWhitelistedUsersByAgencyCodeAndEserviceNameAndEmails(
      agencyCode,
      eserviceName,
      emails,
    );
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateEserviceWhitelistedUsersByEmails(
    emails: string[],
    dataToBeUpdated: EserviceWhitelistedUserUpdateModel,
    entityManager?: EntityManager,
  ) {
    return await this.eserviceWhitelistedUserEntityRepository.updateEserviceWhitelistedUsersByEmails(
      emails,
      dataToBeUpdated,
      entityManager,
    );
  }
}
