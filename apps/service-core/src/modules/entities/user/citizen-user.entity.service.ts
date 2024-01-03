import {
  EntityNotFoundException,
  maskUin,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';

import { CitizenUser, CitizenUserCreationModel, CitizenUserUpdateModel } from '../../../entities/user';
import { generateEntityUUID } from '../../../utils/helpers';
import { CitizenUserEntityRepository } from './citizen-user.entity.repository';

@Injectable()
export class CitizenUserEntityService {
  private readonly logger = new Logger(CitizenUserEntityService.name);

  constructor(private readonly citizenUserEntityRepository: CitizenUserEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildCitizenUser(citizenUserModel: CitizenUserCreationModel): CitizenUser {
    return this.citizenUserEntityRepository.getRepository().create({
      uuid: generateEntityUUID(CitizenUser.name),
      ...citizenUserModel,
    });
  }

  public async insertCitizenUsers(citizenUserModels: CitizenUserCreationModel[], entityManager?: EntityManager) {
    const citizenUsers = citizenUserModels.map((model) => this.buildCitizenUser(model));
    return await this.citizenUserEntityRepository.getRepository(entityManager).insert(citizenUsers);
  }

  public async saveCitizenUsers(citizenUserModels: CitizenUserCreationModel[], entityManager?: EntityManager) {
    const citizenUsers = citizenUserModels.map((model) => this.buildCitizenUser(model));
    return await this.citizenUserEntityRepository.getRepository(entityManager).save(citizenUsers);
  }

  public async saveCitizenUser(citizenUserModel: CitizenUserCreationModel, entityManager?: EntityManager) {
    return (await this.saveCitizenUsers([citizenUserModel], entityManager))[0];
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveCitizenUserById(id: number, entityManager?: EntityManager) {
    const citizenUser = await this.citizenUserEntityRepository.getRepository(entityManager).findOne({
      where: {
        id,
      },
    });

    if (!citizenUser) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.CITIZEN_USER_SERVICE, CitizenUser.name, 'id', id);
    }

    return citizenUser;
  }

  public async retrieveCitizenUserByUin(uin: string, opts?: ServiceMethodThrowOptions): Promise<CitizenUser>;
  public async retrieveCitizenUserByUin(uin: string, opts?: ServiceMethodDontThrowOptions): Promise<CitizenUser | null>;
  public async retrieveCitizenUserByUin(uin: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const existingUser = await this.citizenUserEntityRepository.getRepository(opts.entityManager).findOne({
      where: {
        uin,
      },
    });

    if (!existingUser && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, CitizenUser.name, 'uin', maskUin(uin));
    }

    return existingUser;
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateCitizenUserById(
    id: number,
    dataToBeUpdate: CitizenUserUpdateModel,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.citizenUserEntityRepository.getRepository(entityManager).update({ id }, dataToBeUpdate);
  }
}
