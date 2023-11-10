import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CorporateUser } from '../../../../entities/corporate-user';

@Injectable()
export class CorporateUserEntityRepository {
  public constructor(
    @InjectRepository(CorporateUser)
    private corporateUserRepository: Repository<CorporateUser>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(CorporateUser) : this.corporateUserRepository;
  }
}
