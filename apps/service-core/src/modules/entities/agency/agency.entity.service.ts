import { EntityNotFoundException, ServiceMethodDontThrowOptions } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, DateRange, STATUS, TEMPLATE_TYPE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { EntityManager, FindOneOptions } from 'typeorm';

import { Agency, AgencyCreationModel } from '../../../entities/agency';
import { generateEntityUUID } from '../../../utils/helpers';
import { AgencyEntityRepository } from './agency.entity.repository';

@Injectable()
export class AgencyEntityService {
  constructor(private readonly agencyRepository: AgencyEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildAgency(agencyModel: AgencyCreationModel) {
    return this.agencyRepository.getRepository().create({
      uuid: generateEntityUUID(Agency.name),
      status: STATUS.ACTIVE,
      ...agencyModel,
    });
  }

  public async saveAgencies(agencyModels: AgencyCreationModel[], entityManager?: EntityManager) {
    const agencies = agencyModels.map((model) => this.buildAgency(model));
    return await this.agencyRepository.getRepository(entityManager).save(agencies);
  }

  public async saveAgency(agencyModel: AgencyCreationModel, entityManager?: EntityManager) {
    return (await this.saveAgencies([agencyModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async isAgencyExistsByCode(agencyCode: string, entityManager?: EntityManager) {
    return !!(await this.agencyRepository.findByCode(agencyCode, undefined, entityManager));
  }

  public async isAgencyExistByIdentityProofLocation(location: string, entityManager?: EntityManager) {
    return !!(await this.agencyRepository.findByIdentityProofLocation(location, undefined, entityManager));
  }

  public async retrieveAgencyWithEservicesByCode(agencyCode: string, entityManager?: EntityManager) {
    const agency = await this.agencyRepository.findAgencyWithEservicesByCode(agencyCode, entityManager);

    if (!agency) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Agency.name, 'code', agencyCode);
    }

    return agency;
  }

  public async retrieveAgencyByCodeWithTemplatesByNames(
    agencyCode: string,
    templateNames: string[],
    templateType: TEMPLATE_TYPE,
    entityManager?: EntityManager,
    opts?: ServiceMethodDontThrowOptions,
  ) {
    const agency = await this.agencyRepository.findAgencyByCodeWithTemplatesByNames(agencyCode, templateNames, templateType, entityManager);

    if (!agency && opts?.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Agency.name, 'code', agencyCode);
    }

    return agency;
  }

  public async retrieveAgencyByIdWithFormSgTransactionAndNotificationTemplates(id: number) {
    const agency = await this.agencyRepository.findAgencyByIdWithFormSgTransactionAndNotificationTemplates(id);

    if (!agency) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Agency.name, 'id', id);
    }

    return agency;
  }

  public async retrieveAgencyByCode(agencyCode: string, options?: FindOneOptions<Agency>, entityManager?: EntityManager) {
    const agency = await this.agencyRepository.findByCode(agencyCode, options, entityManager);

    if (!agency) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Agency.name, 'code', agencyCode);
    }

    return agency;
  }

  // gd TODO: add unit test
  public async retrieveAgenciesByCodes(agencyCodes: string[], entityManager?: EntityManager) {
    return await this.agencyRepository.findAgenciesByCodes(agencyCodes, entityManager);
  }

  public async retrieveAllAgencyNamesAndCodes(entityManager?: EntityManager) {
    return await this.agencyRepository.findAllAgencyNamesAndCodes(entityManager);
  }

  public async retrieveCountAgencyAndEservices(dateRange: DateRange, entityManager?: EntityManager) {
    const result = await this.agencyRepository.findCountAgencyAndEservices(dateRange, entityManager);

    if (!result) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Agency.name, 'agency and eservice count');
    }

    return result;
  }
}
