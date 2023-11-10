import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { EntityManager, FindManyOptions, In, InsertResult } from 'typeorm';

import { Eservice, EserviceCreationModel } from '../../../entities/eservice';
import { generateEntityUUID } from '../../../utils/helpers';
import { EserviceEntityRepository } from './eservice.entity.repository';

@Injectable()
export class EserviceEntityService {
  constructor(private readonly eserviceRepository: EserviceEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildEservice(eserviceModel: EserviceCreationModel) {
    return this.eserviceRepository.getRepository().create({
      uuid: generateEntityUUID(Eservice.name),
      ...eserviceModel,
    });
  }

  public async insertEservices(eserviceModels: EserviceCreationModel[], returnEntity?: true, entityManager?: EntityManager): Promise<Eservice[]>; // prettier-ignore
  public async insertEservices(eserviceModels: EserviceCreationModel[], returnEntity?: false, entityManager?: EntityManager): Promise<InsertResult>; // prettier-ignore
  public async insertEservices(
    eserviceModels: EserviceCreationModel[],
    returnEntity?: boolean,
    entityManager?: EntityManager,
  ): Promise<Eservice[] | InsertResult> {
    const eservices = eserviceModels.map((model) => this.buildEservice(model));
    const insertResults = await this.eserviceRepository.getRepository(entityManager).insert(eservices);

    if (returnEntity) {
      // sorted by id to ensure that the returned entity are in the same order
      return await this.eserviceRepository.getRepository(entityManager).find({
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

  public async saveEservices(eserviceModels: EserviceCreationModel[], entityManager?: EntityManager) {
    const eservice = eserviceModels.map((model) => this.buildEservice(model));
    return await this.eserviceRepository.getRepository(entityManager).save(eservice);
  }

  public async saveEservice(eserviceModel: EserviceCreationModel, entityManager?: EntityManager) {
    return (await this.saveEservices([eserviceModel], entityManager))[0];
  }

  public async associateUsersToEservice(associationModels: Array<{ eserviceId: number; userId: number }>, entityManager?: EntityManager) {
    return await this.eserviceRepository
      .getRepository(entityManager)
      .createQueryBuilder()
      .insert()
      .into('eservice_user')
      .values(associationModels)
      .execute();
  }

  public async associateApplicationTypeToEservice(
    associationModels: Array<{ eserviceId: number; applicationTypeId: number }>,
    entityManager?: EntityManager,
  ) {
    return await this.eserviceRepository
      .getRepository(entityManager)
      .createQueryBuilder()
      .insert()
      .into('eservice_application_type')
      .values(associationModels)
      .execute();
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveEserviceByUserId(userId: number, opts?: ServiceMethodThrowOptions): Promise<Eservice>;
  public async retrieveEserviceByUserId(userId: number, opts?: ServiceMethodDontThrowOptions): Promise<Eservice | null>;
  public async retrieveEserviceByUserId(userId: number, opts: ServiceMethodOptions = { toThrow: true }) {
    const eservice = await this.eserviceRepository.findEserviceByUserId(userId);

    if (!eservice && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ESERVICE_SERVICE, Eservice.name, 'userId', `${userId}`);
    }

    return eservice;
  }

  public async retrieveEserviceByAgencyId(agencyId: number, options?: FindManyOptions<Eservice>) {
    return await this.eserviceRepository.findByAgencyId(agencyId, options);
  }

  public async retrieveEserviceByAgencyCodeAndEserviceName(agencyCode: string, eserviceName: string): Promise<Eservice> {
    const eservice = await this.eserviceRepository.findEserviceByAgencyCodeAndEserviceName(agencyCode, eserviceName);

    if (!eservice) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.ESERVICE_SERVICE,
        Eservice.name,
        'agencyCode & eserviceName',
        `${agencyCode} & ${eserviceName}`,
      );
    }

    return eservice;
  }
}
