/* eslint-disable sonarjs/no-duplicate-string */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { AcknowledgementTemplate } from '../../../entities/acknowledgement-template';

@Injectable()
export class AcknowledgementTemplateEntityRepository {
  public constructor(
    @InjectRepository(AcknowledgementTemplate)
    private acknowledgementTemplateRepository: Repository<AcknowledgementTemplate>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(AcknowledgementTemplate) : this.acknowledgementTemplateRepository;
  }
}
