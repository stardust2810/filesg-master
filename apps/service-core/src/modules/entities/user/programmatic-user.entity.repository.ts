import { USER_TYPE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ProgrammaticUser } from '../../../entities/user';

@Injectable()
export class ProgrammaticUserEntityRepository {
  public constructor(
    @InjectRepository(ProgrammaticUser)
    private programmaticUserRepository: Repository<ProgrammaticUser>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(ProgrammaticUser) : this.programmaticUserRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findByEServiceUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('programmaticUser')
      .leftJoinAndSelect('programmaticUser.eservices', 'eservice')
      .where('eservice.uuid = :uuid', { uuid })
      .andWhere('programmaticUser.type = :type', { type: USER_TYPE.PROGRAMMATIC })
      .getOne();
  }

  public async findAllEservicesProgrammaticUsersByUserId(userId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('programmaticUser')
      .leftJoinAndSelect('programmaticUser.eservices', 'eservices')
      .leftJoinAndSelect('eservices.users', 'eserviceUsers')
      .where('programmaticUser.id = :id', { id: userId })
      .andWhere('eserviceUsers.type = :type', { type: USER_TYPE.PROGRAMMATIC })
      .getOne();
  }
}
