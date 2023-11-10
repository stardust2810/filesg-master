import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { OACertificate, OaCertificateCreationModel, OaCertificateUpdateModel } from '../../../entities/oa-certificate';
import { OaCertificateEntityRepository } from './oa-certificate.entity.repository';

@Injectable()
export class OaCertificateEntityService {
  private readonly logger = new Logger(OaCertificateEntityService.name);

  constructor(private readonly oaCertificateRepository: OaCertificateEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildOaCertificate(oaCertificateModel: OaCertificateCreationModel) {
    return this.oaCertificateRepository.getRepository().create(oaCertificateModel);
  }

  public async saveOaCertificates(oaCertificateModels: OaCertificateCreationModel[], entityManager?: EntityManager) {
    const oaCertificates = oaCertificateModels.map((model) => this.buildOaCertificate(model));
    return await this.oaCertificateRepository.getRepository(entityManager).save(oaCertificates);
  }

  public async saveOaCertificate(oaCertificateModel: OaCertificateCreationModel, entityManager?: EntityManager) {
    return (await this.saveOaCertificates([oaCertificateModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveOaCertificateWithFileAssetExpiry(certificateIdentifier: string) {
    const oaCertificate = await this.oaCertificateRepository.findOaCertificateWithFileAssetExpiry(certificateIdentifier);

    if (!oaCertificate) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE, OACertificate.name, 'id', certificateIdentifier);
    }

    return oaCertificate;
  }

  // =============================================================================
  // Update
  // =============================================================================
  public async updateOaCertificates(ids: string[], dataToBeUpdated: OaCertificateUpdateModel, entityManager?: EntityManager) {
    return await this.oaCertificateRepository.updateOaCertificates(ids, dataToBeUpdated, entityManager);
  }
}
