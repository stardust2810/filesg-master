import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Corporate } from '../../../../entities/corporate';

@Injectable()
export class CorporateEntityRepository {
  public constructor(
    @InjectRepository(Corporate)
    private corporateRepository: Repository<Corporate>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(Corporate) : this.corporateRepository;
  }
}
