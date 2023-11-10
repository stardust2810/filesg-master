import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { AgencyUser } from '../../../entities/user';

@Injectable()
export class AgencyUserEntityRepository {
  public constructor(
    @InjectRepository(AgencyUser)
    private agencyUserRepository: Repository<AgencyUser>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(AgencyUser) : this.agencyUserRepository;
  }
}
