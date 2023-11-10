import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, In, InsertResult } from 'typeorm';

import { AcknowledgementTemplate, AcknowledgementTemplateCreationModel } from '../../../entities/acknowledgement-template';
import { generateEntityUUID } from '../../../utils/helpers';
import { AcknowledgementTemplateEntityRepository } from './acknowledgement-template.entity.repository';

@Injectable()
export class AcknowledgementTemplateEntityService {
  private readonly logger = new Logger(AcknowledgementTemplateEntityService.name);

  constructor(private readonly acknowledgementTemplateRepository: AcknowledgementTemplateEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildAcknowledgementTemplate(acknowledgementTemplateModel: AcknowledgementTemplateCreationModel) {
    return this.acknowledgementTemplateRepository.getRepository().create({
      uuid: generateEntityUUID(AcknowledgementTemplate.name),
      ...acknowledgementTemplateModel,
    });
  }

  public async insertAcknowledgementTemplates(acknowledgementTemplateModels: AcknowledgementTemplateCreationModel[], returnEntity?: true, entityManager?: EntityManager): Promise<AcknowledgementTemplate[]>; //prettier-ignore
  public async insertAcknowledgementTemplates(acknowledgementTemplateModels: AcknowledgementTemplateCreationModel[], returnEntity?: false, entityManager?: EntityManager): Promise<InsertResult>; //prettier-ignore
  public async insertAcknowledgementTemplates(
    acknowledgementTemplateModels: AcknowledgementTemplateCreationModel[],
    returnEntity?: boolean,
    entityManager?: EntityManager,
  ): Promise<AcknowledgementTemplate[] | InsertResult> {
    const acknowledgementTemplates = acknowledgementTemplateModels.map((model) => this.buildAcknowledgementTemplate(model));
    const insertResults = await this.acknowledgementTemplateRepository.getRepository(entityManager).insert(acknowledgementTemplates);

    if (returnEntity) {
      // sorted by id to ensure that the returned entity are in the same order
      return await this.acknowledgementTemplateRepository.getRepository(entityManager).find({
        where: {
          id: In(insertResults.identifiers.map((identifier) => identifier.id)),
        },
        order: {
          id: 'ASC',
        },
      });
    }

    return insertResults;
  }

  public async saveAcknowledgementTemplates(
    acknowledgementTemplateModels: AcknowledgementTemplateCreationModel[],
    entityManager?: EntityManager,
  ) {
    const acknowledgementTemplates = acknowledgementTemplateModels.map((model) => this.buildAcknowledgementTemplate(model));
    return await this.acknowledgementTemplateRepository.getRepository(entityManager).save(acknowledgementTemplates);
  }

  public async saveAcknowledgementTemplate(
    acknowledgementTemplateModel: AcknowledgementTemplateCreationModel,
    entityManager?: EntityManager,
  ) {
    return (await this.saveAcknowledgementTemplates([acknowledgementTemplateModel], entityManager))[0];
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveAcknowledgementTemplateByUuid(uuid: string, opts?: ServiceMethodThrowOptions): Promise<AcknowledgementTemplate>;
  public async retrieveAcknowledgementTemplateByUuid(
    uuid: string,
    opts?: ServiceMethodDontThrowOptions,
  ): Promise<AcknowledgementTemplate | null>;
  public async retrieveAcknowledgementTemplateByUuid(uuid: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const activity = await this.acknowledgementTemplateRepository.getRepository(opts.entityManager).findOne({ where: { uuid } });

    if (!activity && opts.toThrow) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.ACKNOWLEDGEMENT_TEMPLATE_ENTITY_SERVICE,
        AcknowledgementTemplate.name,
        'uuid',
        `${uuid}`,
      );
    }

    return activity;
  }
}
