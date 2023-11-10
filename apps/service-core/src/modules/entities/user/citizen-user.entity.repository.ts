import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CitizenUser } from '../../../entities/user';

@Injectable()
export class CitizenUserEntityRepository {
  public constructor(
    @InjectRepository(CitizenUser)
    private citizenUserRepository: Repository<CitizenUser>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(CitizenUser) : this.citizenUserRepository;
  }
}
