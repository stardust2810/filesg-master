import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { ACTIVITY_TYPE, COMPONENT_ERROR_CODE, DateRange } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { EntityManager, InsertResult } from 'typeorm';

import { Application, ApplicationCreationModel } from '../../../entities/application';
import { generateEntityUUID } from '../../../utils/helpers';
import { ApplicationEntityRepository } from './application.entity.repository';

@Injectable()
export class ApplicationEntityService {
  constructor(private readonly applicationRepository: ApplicationEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildApplication(applicationModel: ApplicationCreationModel) {
    return this.applicationRepository.getRepository().create({
      uuid: generateEntityUUID(Application.name),
      ...applicationModel,
    });
  }

  public async insertApplications(applicationModels: ApplicationCreationModel[], entityManager?: EntityManager) {
    const applications = applicationModels.map((model) => this.buildApplication(model));
    return await this.applicationRepository.getRepository(entityManager).insert(applications);
  }

  public async saveApplications(applicationModels: ApplicationCreationModel[], entityManager?: EntityManager) {
    const applications = applicationModels.map((model) => this.buildApplication(model));
    return await this.applicationRepository.getRepository(entityManager).save(applications);
  }

  public async saveApplication(applicationModel: ApplicationCreationModel, entityManager?: EntityManager) {
    return (await this.saveApplications([applicationModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
    externalRefId: string,
    eserviceId: number,
    applicationTypeId: number,
    opts?: ServiceMethodThrowOptions,
  ): Promise<Application>;
  public async retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
    externalRefId: string,
    eserviceId: number,
    applicationTypeId: number,
    opts?: ServiceMethodDontThrowOptions,
  ): Promise<Application | null>;
  public async retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
    externalRefId: string,
    eserviceId: number,
    applicationTypeId: number,
    opts: ServiceMethodOptions = { toThrow: true },
  ) {
    const application = await this.applicationRepository.findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
      externalRefId,
      eserviceId,
      applicationTypeId,
      opts.entityManager,
    );

    if (!application && opts.toThrow) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        Application.name,
        'externalRefId and eserviceId',
        `${externalRefId} and ${eserviceId}`,
      );
    }

    return application;
  }

  public async retrieveApplicationByTransactionUuid(transactionUuid: string, entityManager?: EntityManager) {
    const application = await this.applicationRepository.findApplicationByTransactionUuid(transactionUuid, entityManager);

    if (!application) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Application.name, 'transactionUuid', transactionUuid);
    }

    return application;
  }

  public async retrieveApplicationWithTransactionsAndActivitiesDetailsByExternalRefId(
    externalRefId: string,
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ): Promise<Application | null> {
    return await this.applicationRepository.findApplicationWithTransactionsAndActivitiesDetailsByExternalRefId(
      externalRefId,
      types,
      entityManager,
    );
  }

  public async retrieveApplicationsWithTransactionsAndActivitiesDetailsByIds(
    ids: number[],
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ): Promise<Application[]> {
    return await this.applicationRepository.findApplicationsWithTransactionsAndActivitiesDetailsByIds(ids, types, entityManager);
  }

  public async retrieveApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes(
    uuid: string,
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ) {
    return await this.applicationRepository.findApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes(
      uuid,
      types,
      entityManager,
    );
  }

  public async retrieveApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo(
    recipientInfo: string,
    agencyCode: string,
    { startDate, endDate }: DateRange,
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ) {
    return await this.applicationRepository.findApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo(
      recipientInfo,
      agencyCode,
      { startDate, endDate },
      types,
      entityManager,
    );
  }
  // ===========================================================================
  // Update
  // ===========================================================================
  public async upsertApplication(applicationModel: ApplicationCreationModel, entityManager?: EntityManager): Promise<InsertResult> {
    const application = this.buildApplication(applicationModel);
    return await this.applicationRepository
      .getRepository(entityManager)
      .upsert(application, { conflictPaths: ['externalRefId'], skipUpdateIfNoValuesChanged: false });
  }
}
