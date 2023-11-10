import { DateRange, STATUS, TEMPLATE_TYPE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { Agency } from '../../../entities/agency';

@Injectable()
export class AgencyEntityRepository {
  public constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(Agency) : this.agencyRepository;
  }

  public async findByCode(code: string, options?: FindOneOptions<Agency>, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: { code },
      ...options,
    });
  }

  public async findAgenciesByCodes(codes: string[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager).createQueryBuilder('agency').where('agency.code IN(:...codes)', { codes }).getMany();
  }

  public async findByIdentityProofLocation(identityProofLocation: string, options?: FindOneOptions<Agency>, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: {
        identityProofLocation,
      },
      ...options,
    });
  }

  public async findAgencyWithEservicesByCode(code: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: { code },
      relations: ['eservices'],
    });
  }

  public async findAgencyByCodeWithTemplatesByNames(
    code: string,
    templateNames: string[],
    templateType: TEMPLATE_TYPE,
    entityManager?: EntityManager,
  ) {
    /*
    The "templates.name IN (:...templateNames)" clause is in the left join because if I do it like this:
    .andWhere('transactionCustomMessageTemplates.name IN (:...templateNames)', { templateNames })
    it will exclude any agency with no duplicate templates. We want this to return agency without any duplicates as well.
    */
    const leftJoinQuery =
      templateType === TEMPLATE_TYPE.TRANSACTION_CUSTOM_MESSAGE
        ? 'agency.transactionCustomMessageTemplates'
        : 'agency.notificationMessageTemplates';
    return await this.getRepository(entityManager)
      .createQueryBuilder('agency')
      .leftJoin(leftJoinQuery, 'templates', 'templates.name IN (:...templateNames)', { templateNames })
      .addSelect(['templates.name'])
      .where('agency.code = :code', { code })
      .getOne();
  }

  public async findAgencyByIdWithFormSgTransactionAndNotificationTemplates(id: number) {
    return await this.getRepository()
      .createQueryBuilder('agency')
      .leftJoinAndSelect('agency.transactionCustomMessageTemplates', 'transactionTemplates')
      .leftJoinAndSelect('agency.notificationMessageTemplates', 'notificationTemplates')
      .where('agency.id = :id', { id })
      .getOne();
  }

  public async findAllAgencyNamesAndCodes(entityManager?: EntityManager) {
    return await this.getRepository(entityManager).find({
      select: {
        name: true,
        code: true,
      },
    });
  }

  public async findCountAgencyAndEservices(dateRange: DateRange, entityManager?: EntityManager) {
    const { startDate, endDate } = dateRange;

    const query = await this.getRepository(entityManager)
      .createQueryBuilder('agency')
      .select('COUNT(DISTINCT agency.id)', 'agencyCount')
      .addSelect('COUNT(eservices.id)', 'eserviceCount')
      .leftJoin('agency.eservices', 'eservices')
      .where('agency.status = :status', { status: STATUS.ACTIVE });

    if (startDate) {
      query.andWhere({ createdAt: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      query.andWhere({ createdAt: LessThanOrEqual(endDate) });
    }

    return query.getRawOne<{ agencyCount: string; eserviceCount: string }>();
  }
}
