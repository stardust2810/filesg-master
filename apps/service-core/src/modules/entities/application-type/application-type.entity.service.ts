import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';

import { ApplicationType, ApplicationTypeCreationModel } from '../../../entities/application-type';
import { generateEntityUUID } from '../../../utils/helpers';
import { ApplicationTypeEntityRepository } from './application-type.entity.repository';

@Injectable()
export class ApplicationTypeEntityService {
  private readonly logger = new Logger(ApplicationTypeEntityService.name);

  constructor(private readonly applicationTypeEntityRepository: ApplicationTypeEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildApplicationType(applicationTypeModel: ApplicationTypeCreationModel) {
    return this.applicationTypeEntityRepository.getRepository().create({
      uuid: generateEntityUUID(ApplicationType.name),
      ...applicationTypeModel,
    });
  }

  public async insertApplicationTypes(applicationTypeModels: ApplicationTypeCreationModel[], entityManager?: EntityManager) {
    const applicationTypes = applicationTypeModels.map((model) => this.buildApplicationType(model));
    return await this.applicationTypeEntityRepository.getRepository(entityManager).insert(applicationTypes);
  }

  public async saveApplicationTypes(applicationTypeModels: ApplicationTypeCreationModel[], entityManager?: EntityManager) {
    const applicationTypes = applicationTypeModels.map((model) => this.buildApplicationType(model));
    return await this.applicationTypeEntityRepository.getRepository(entityManager).save(applicationTypes);
  }

  public async saveApplicationType(applicationTypeModel: ApplicationTypeCreationModel, entityManager?: EntityManager) {
    return (await this.saveApplicationTypes([applicationTypeModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveApplicationTypesByCodes(codes: string[], entityManager?: EntityManager) {
    return await this.applicationTypeEntityRepository.getRepository(entityManager).find({
      where: { code: In(codes) },
    });
  }

  public async retrieveApplicationTypeByCodeAndEserviceId(code: string, eserviceId: number, entityManager?: EntityManager) {
    const applicationType = await this.applicationTypeEntityRepository.findApplicationTypeByCodeAndEserviceId(
      code,
      eserviceId,
      entityManager,
    );

    if (!applicationType) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.APPLICATION_TYPE_SERVICE,
        ApplicationType.name,
        'code',
        `${code} for the eservice`,
      );
    }

    return applicationType;
  }

  public async retrieveApplicationTypeAndNotificationChannelsByEserviceUserId(eserviceUserId: number) {
    return await this.applicationTypeEntityRepository.findApplicationTypesAndNotificationChannelsByEserviceUserId(eserviceUserId);
  }
}
