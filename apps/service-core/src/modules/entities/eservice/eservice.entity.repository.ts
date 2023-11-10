import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, Repository } from 'typeorm';

import { Eservice } from '../../../entities/eservice';

@Injectable()
export class EserviceEntityRepository {
  public constructor(
    @InjectRepository(Eservice)
    private eserviceRepository: Repository<Eservice>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(Eservice) : this.eserviceRepository;
  }

  public async findByUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: {
        uuid,
      },
    });
  }

  public async findByAgencyId(agencyId: number, options?: FindManyOptions<Eservice>, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).find({
      where: {
        agencyId,
      },
      ...options,
    });
  }

  public async findEserviceByUserId(userId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('eservice')
      .where((qb) => {
        const subQuery = qb.subQuery().select('eserviceId').from('eservice_user', 'eservice_user').where({ userId }).getQuery();
        return 'id IN ' + subQuery;
      })
      .getOne();
  }

  public async findEserviceByAgencyCodeAndEserviceName(agencyCode: string, eserviceName: string): Promise<Eservice | null> {
    return await this.getRepository()
      .createQueryBuilder('eservice')
      .leftJoin('eservice.agency', 'agency')
      .where('eservice.name = :eserviceName', { eserviceName })
      .andWhere('agency.code = :agencyCode', { agencyCode })
      .getOne();
  }
}
