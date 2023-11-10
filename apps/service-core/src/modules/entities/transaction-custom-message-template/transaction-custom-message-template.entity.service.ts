import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';

import {
  TransactionCustomMessageTemplate,
  TransactionCustomMessageTemplateCreationModel,
  TransactionCustomMessageTemplateyUpdateModel,
} from '../../../entities/transaction-custom-message-template';
import { generateEntityUUID } from '../../../utils/helpers';
import { TransactionCustomMessageTemplateEntityRepository } from './transaction-custom-message-template.entity.repository';

@Injectable()
export class TransactionCustomMessageTemplateEntityService {
  private readonly logger = new Logger(TransactionCustomMessageTemplateEntityService.name);

  constructor(private readonly transactionCustomMessageTemplateEntityRepository: TransactionCustomMessageTemplateEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildTransactionCustomMessageTemplate(transactionCustomMessageTemplateModel: TransactionCustomMessageTemplateCreationModel) {
    return this.transactionCustomMessageTemplateEntityRepository.getRepository().create({
      uuid: generateEntityUUID(TransactionCustomMessageTemplate.name),
      ...transactionCustomMessageTemplateModel,
    });
  }

  public async insertTransactionCustomMessageTemplates(
    transactionCustomMessageTemplateModels: TransactionCustomMessageTemplateCreationModel[],
    entityManager?: EntityManager,
  ) {
    const transactionCustomMessageTemplates = transactionCustomMessageTemplateModels.map((model) =>
      this.buildTransactionCustomMessageTemplate(model),
    );
    return await this.transactionCustomMessageTemplateEntityRepository
      .getRepository(entityManager)
      .insert(transactionCustomMessageTemplates);
  }

  public async saveTransactionCustomMessageTemplates(
    transactionCustomMessageTemplateModels: TransactionCustomMessageTemplateCreationModel[],
    entityManager?: EntityManager,
  ) {
    const transactionCustomMessageTemplates = transactionCustomMessageTemplateModels.map((model) =>
      this.buildTransactionCustomMessageTemplate(model),
    );
    return await this.transactionCustomMessageTemplateEntityRepository.getRepository(entityManager).save(transactionCustomMessageTemplates);
  }

  public async saveTransactionCustomMessageTemplate(
    transactionCustomMessageTemplateModel: TransactionCustomMessageTemplateCreationModel,
    entityManager?: EntityManager,
  ) {
    return (await this.saveTransactionCustomMessageTemplates([transactionCustomMessageTemplateModel], entityManager))[0];
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================

  public async retrieveTransactionCustomMessageTemplate(transactionTemplateUuid: string, agencyId: number, entityManager?: EntityManager) {
    return await this.transactionCustomMessageTemplateEntityRepository.findTransactionCustomMessageTemplate(
      transactionTemplateUuid,
      agencyId,
      entityManager,
    );
  }

  public async retrieveFormsgTransactionCustomMessageTemplatesByEserviceUserId(eserviceUserId: number, entityManager?: EntityManager) {
    const transactionCustomMessageTemplate =
      await this.transactionCustomMessageTemplateEntityRepository.findFormsgTransactionCustomMessageTemplatesByEserviceUserId(
        eserviceUserId,
        entityManager,
      );

    if (!transactionCustomMessageTemplate) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.TRANSACTION_CUSTOM_MESSAGE_TEMPLATE_ENTITY_SERVICE,
        TransactionCustomMessageTemplate.name,
        'eserviceUserId',
        eserviceUserId,
      );
    }

    return transactionCustomMessageTemplate;
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateTransactionCustomMessageTemplate(
    uuid: string,
    dataToBeUpdated: TransactionCustomMessageTemplateyUpdateModel,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.transactionCustomMessageTemplateEntityRepository.updateTransactionCustomMessageTemplate(
      uuid,
      dataToBeUpdated,
      entityManager,
    );
  }
}
