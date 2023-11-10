import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { OACertificate, OaCertificateUpdateModel } from '../../../entities/oa-certificate';

@Injectable()
export class OaCertificateEntityRepository {
  public constructor(
    @InjectRepository(OACertificate)
    private oaCertificateRepository: Repository<OACertificate>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(OACertificate) : this.oaCertificateRepository;
  }
  // ===========================================================================
  // Read
  // ===========================================================================
  public async findOaCertificateWithFileAssetExpiry(certificateIdentifier: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('oaCertificate')
      .leftJoinAndSelect('oaCertificate.fileAssets', 'fileAssets')
      .where('oaCertificate.id = :id', { id: certificateIdentifier })
      .orWhere('oaCertificate.hash = :id', { id: certificateIdentifier })
      .getOne();
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateOaCertificates(ids: string[], dataToBeUpdated: OaCertificateUpdateModel, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder()
      .update(OACertificate)
      .set(dataToBeUpdated)
      .where('id IN (:...ids)', { ids })
      .execute();
  }
}
