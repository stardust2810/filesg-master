import { INTEGRATION_TYPE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import {
  TransactionCustomMessageTemplate,
  TransactionCustomMessageTemplateyUpdateModel,
} from '../../../entities/transaction-custom-message-template';

@Injectable()
export class TransactionCustomMessageTemplateEntityRepository {
  public constructor(
    @InjectRepository(TransactionCustomMessageTemplate)
    private transactionCustomMessageTemplateRepository: Repository<TransactionCustomMessageTemplate>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(TransactionCustomMessageTemplate) : this.transactionCustomMessageTemplateRepository;
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async findTransactionCustomMessageTemplate(transactionTemplateUuid: string, agencyId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('transactionCustomMessageTemplate')
      .where('transactionCustomMessageTemplate.uuid = :transactionTemplateUuid', { transactionTemplateUuid })
      .andWhere('transactionCustomMessageTemplate.agencyId = :agencyId', { agencyId })
      .getOne();
  }

  public async findFormsgTransactionCustomMessageTemplatesByEserviceUserId(eserviceUserId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('transactionCustomMessageTemplate')
      .leftJoin('transactionCustomMessageTemplate.agency', 'agency')
      .leftJoin('agency.eservices', 'eservices')
      .leftJoin('eservices.users', 'users')
      .where('users.id = :eserviceUserId', { eserviceUserId })
      .andWhere('transactionCustomMessageTemplate.integrationType = :integrationType', { integrationType: INTEGRATION_TYPE.FORMSG })
      .getOne();
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateTransactionCustomMessageTemplate(
    uuid: string,
    dataToBeUpdated: TransactionCustomMessageTemplateyUpdateModel,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager).update({ uuid }, dataToBeUpdated);
  }
}
