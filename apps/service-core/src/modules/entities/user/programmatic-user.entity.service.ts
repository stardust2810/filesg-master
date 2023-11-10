import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, InsertResult } from 'typeorm';

import { ProgrammaticUser, ProgrammaticUserCreationModel } from '../../../entities/user';
import { generateEntityUUID } from '../../../utils/helpers';
import { ProgrammaticUserEntityRepository } from './programmatic-user.entity.repository';

@Injectable()
export class ProgrammaticUserEntityService {
  private logger = new Logger(ProgrammaticUserEntityService.name);

  constructor(private readonly programmaticUserEntityRepository: ProgrammaticUserEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildProgrammaticUser(programmaticUserModel: ProgrammaticUserCreationModel) {
    return this.programmaticUserEntityRepository.getRepository().create({
      uuid: generateEntityUUID(ProgrammaticUser.name),
      ...programmaticUserModel,
    });
  }

  public async insertProgrammaticUsers(
    programmaticUserModels: ProgrammaticUserCreationModel[],
    entityManager?: EntityManager,
  ): Promise<InsertResult> {
    const programmaticUsers = programmaticUserModels.map((model) => this.buildProgrammaticUser(model));
    return await this.programmaticUserEntityRepository.getRepository(entityManager).insert(programmaticUsers);
  }

  public async saveProgrammaticUsers(
    programmaticUserModels: ProgrammaticUserCreationModel[],
    entityManager?: EntityManager,
  ): Promise<ProgrammaticUser[]> {
    const programmaticUsers = programmaticUserModels.map((model) => this.buildProgrammaticUser(model));
    return await this.programmaticUserEntityRepository.getRepository(entityManager).save(programmaticUsers);
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveProgrammaticUserByClientId(clientId: string, opts?: ServiceMethodThrowOptions): Promise<ProgrammaticUser>;
  public async retrieveProgrammaticUserByClientId(clientId: string, opts?: ServiceMethodDontThrowOptions): Promise<ProgrammaticUser | null>; // prettier-ignore
  public async retrieveProgrammaticUserByClientId(clientId: string, { entityManager, toThrow = true }: ServiceMethodOptions = {}) {
    const programmaticUser = await this.programmaticUserEntityRepository.getRepository(entityManager).findOne({
      where: {
        clientId,
      },
    });

    if (!programmaticUser && toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.PROGRAMMATIC_USER_SERVICE, ProgrammaticUser.name, 'clientId', clientId);
    }

    return programmaticUser;
  }

  public async retrieveAllEservicesProgrammaticUsersByUserId(userId: number, entityManager?: EntityManager) {
    const user = await this.programmaticUserEntityRepository.findAllEservicesProgrammaticUsersByUserId(userId, entityManager);

    if (!user || user.eservices?.length !== 1 || !user.eservices[0].users || user.eservices[0].users.length === 0) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.PROGRAMMATIC_USER_SERVICE, ProgrammaticUser.name, 'userId', userId);
    }

    return user.eservices[0].users as ProgrammaticUser[];
  }
}
