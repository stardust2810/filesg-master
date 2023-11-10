import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';

import { AgencyUserUpdateModel, CitizenUserUpdateModel, ProgrammaticUserUpdateModel, User } from '../../../entities/user';
import { UserEntityRepository } from './user.entity.repository';

@Injectable()
export class UserEntityService {
  private readonly logger = new Logger(UserEntityService.name);

  constructor(private readonly userEntityRepository: UserEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveUserById(id: number, entityManager?: EntityManager) {
    const existingUser = await this.userEntityRepository.getRepository(entityManager).findOne({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'id', id);
    }

    return existingUser;
  }

  public async retrieveUserByUuid(uuid: string, entityManager?: EntityManager) {
    const existingUser = await this.userEntityRepository.getRepository(entityManager).findOne({
      where: {
        uuid,
      },
    });

    if (!existingUser) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'uuid', uuid);
    }

    return existingUser;
  }

  public async retrieveUserWithEserviceAndAgencyById(id: number, entityManager?: EntityManager) {
    const existingUser = await this.userEntityRepository.findUserWithEserviceAndAgencyById(id, entityManager);

    if (!existingUser) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'id', id);
    }

    return existingUser;
  }

  // Whenever there is a need to provide option toThrow, use overload method as following
  public async retrieveUserByUin(uin: string, opts?: ServiceMethodThrowOptions): Promise<User>;
  public async retrieveUserByUin(uin: string, opts?: ServiceMethodDontThrowOptions): Promise<User | null>;
  public async retrieveUserByUin(uin: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const existingUser = await this.userEntityRepository.getRepository(opts.entityManager).findOne({
      where: {
        uin,
      },
    });

    if (!existingUser && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'uin', uin);
    }

    return existingUser;
  }

  public async retrieveUserByEmail(email: string, opts?: ServiceMethodThrowOptions): Promise<User>;
  public async retrieveUserByEmail(email: string, opts?: ServiceMethodDontThrowOptions): Promise<User | null>;
  public async retrieveUserByEmail(email: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const existingUser = await this.userEntityRepository.getRepository(opts.entityManager).findOne({
      where: {
        email,
      },
    });

    if (!existingUser && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'email', email);
    }

    return existingUser;
  }

  public async retrieveCountOnboardedCitizenUserTotalAndWithIssuedDocument(entityManager?: EntityManager) {
    const result = await this.userEntityRepository.findCountOnboardedCitizenUserTotalAndWithIssuedDocument(entityManager);

    if (!result) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'totalOnboardedUserCount');
    }

    return result;
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateUserById(
    id: number,
    dataToBeUpdated: CitizenUserUpdateModel | AgencyUserUpdateModel | ProgrammaticUserUpdateModel,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.userEntityRepository.getRepository(entityManager).update(id, dataToBeUpdated);
  }
}
