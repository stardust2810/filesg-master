import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, ROLE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, InsertResult, UpdateResult } from 'typeorm';

import {
  CorporateUser,
  CorporateUserCreationModel,
  CorporateUserUpdateModel,
  CorporateUserWithBaseUserCreationModel,
} from '../../../../entities/corporate-user';
import { generateEntityUUID } from '../../../../utils/helpers';
import { CorporateUserEntityRepository } from './corporate-user.entity.repository';

@Injectable()
export class CorporateUserEntityService {
  private readonly logger = new Logger(CorporateUserEntityService.name);

  constructor(private readonly corporateUserEntityRepository: CorporateUserEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  // Build
  public buildCorporateUser(corporateUserCreationModel: CorporateUserCreationModel): CorporateUser {
    return this.corporateUserEntityRepository.getRepository().create(corporateUserCreationModel);
  }

  public buildCorporateUserWithBaseUser(corporateUserWithBaseUserCreationModel: CorporateUserWithBaseUserCreationModel) {
    const { user } = corporateUserWithBaseUserCreationModel;
    return this.corporateUserEntityRepository.getRepository().create({
      ...corporateUserWithBaseUserCreationModel,
      user: {
        ...user,
        uuid: generateEntityUUID(CorporateUser.name),
        role: ROLE.CORPORATE_USER,
      },
    });
  }

  // Insert
  // NOTE: insert does not cascade
  public async insertCorporateUsers(
    corporateUserCreationModels: CorporateUserCreationModel[],
    entityManager?: EntityManager,
  ): Promise<InsertResult> {
    const corporateUsers = corporateUserCreationModels.map((model) => this.buildCorporateUser(model));
    return await this.corporateUserEntityRepository.getRepository(entityManager).insert(corporateUsers);
  }

  // Save
  public async saveCorporateUsers(
    corporateUserCreationModels: CorporateUserCreationModel[],
    entityManager?: EntityManager,
  ): Promise<CorporateUser[]> {
    const corporateUsers = corporateUserCreationModels.map((model) => this.buildCorporateUser(model));

    return await this.corporateUserEntityRepository.getRepository(entityManager).save(corporateUsers);
  }

  public async saveCorporateUserWithBaseUser(
    corporateUserWithBaseUserCreationModel: CorporateUserWithBaseUserCreationModel,
    entityManager?: EntityManager,
  ): Promise<CorporateUser> {
    return (await this.saveCorporateUsersWithBaseUsers([corporateUserWithBaseUserCreationModel], entityManager))[0];
  }

  public async saveCorporateUsersWithBaseUsers(
    corporateUserWithBaseUserCreationModels: CorporateUserWithBaseUserCreationModel[],
    entityManager?: EntityManager,
  ): Promise<CorporateUser[]> {
    const corporateUsersWithBaseUser = corporateUserWithBaseUserCreationModels.map((model) => this.buildCorporateUserWithBaseUser(model));

    return await this.corporateUserEntityRepository.getRepository(entityManager).save(corporateUsersWithBaseUser);
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveCorporateUserWithBaseUserByUinAndCorporateId(
    uin: string,
    corporateId: number,
    opts?: ServiceMethodThrowOptions,
  ): Promise<CorporateUser>;
  public async retrieveCorporateUserWithBaseUserByUinAndCorporateId(
    uin: string,
    corporateId: number,
    opts?: ServiceMethodDontThrowOptions,
  ): Promise<CorporateUser | null>;
  public async retrieveCorporateUserWithBaseUserByUinAndCorporateId(
    uin: string,
    corporateId: number,
    opts: ServiceMethodOptions = { toThrow: true },
  ) {
    const corporateUser = await this.corporateUserEntityRepository
      .getRepository()
      .findOne({ where: { uin, corporateId }, relations: ['user'] });

    if (!corporateUser && opts.toThrow) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.CORPORATE_USER_ENTITY_SERVICE,
        CorporateUser.name,
        'uin and corporateId',
        `${uin} and ${corporateId}`,
      );
    }

    return corporateUser;
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateCorporateUserById(
    id: number,
    dataToBeUpdate: CorporateUserUpdateModel,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.corporateUserEntityRepository.getRepository(entityManager).update({ id }, dataToBeUpdate);
  }
}
