import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, ROLE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, InsertResult } from 'typeorm';

import { Corporate, CorporateCreationModel, CorporateWithBaseUserCreationModel } from '../../../../entities/corporate';
import { generateEntityUUID } from '../../../../utils/helpers';
import { CorporateEntityRepository } from './corporate.entity.repository';

@Injectable()
export class CorporateEntityService {
  private readonly logger = new Logger(CorporateEntityService.name);

  constructor(private readonly corporateEntityRepository: CorporateEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  // Build
  public buildCorporate(corporateCreationModel: CorporateCreationModel): Corporate {
    return this.corporateEntityRepository.getRepository().create(corporateCreationModel);
  }

  public buildCorporateWithBaseUser(corporateWithBaseUserCreationModel: CorporateWithBaseUserCreationModel): Corporate {
    const { user } = corporateWithBaseUserCreationModel;
    return this.corporateEntityRepository.getRepository().create({
      ...corporateWithBaseUserCreationModel,
      user: {
        ...user,
        uuid: generateEntityUUID(Corporate.name),
        role: ROLE.CORPORATE,
      },
    });
  }

  // Insert
  // NOTE: insert does not cascade
  public async insertCorporates(corporateCreationModels: CorporateCreationModel[], entityManager?: EntityManager): Promise<InsertResult> {
    const corporates = corporateCreationModels.map((model) => this.buildCorporate(model));
    return await this.corporateEntityRepository.getRepository(entityManager).insert(corporates);
  }

  // Save
  public async saveCorporates(corporateCreationModels: CorporateCreationModel[], entityManager?: EntityManager): Promise<Corporate[]> {
    const corporates = corporateCreationModels.map((model) => this.buildCorporate(model));

    return await this.corporateEntityRepository.getRepository(entityManager).save(corporates);
  }

  public async saveCorporateWithBaseUser(
    corporateWithBaseUserCreationModel: CorporateWithBaseUserCreationModel,
    entityManager?: EntityManager,
  ) {
    return (await this.saveCorporatesWithBaseUsers([corporateWithBaseUserCreationModel], entityManager))[0];
  }

  public async saveCorporatesWithBaseUsers(
    corporateWithBaseUserCreationModels: CorporateWithBaseUserCreationModel[],
    entityManager?: EntityManager,
  ): Promise<Corporate[]> {
    const corporatesWithBaseUser = corporateWithBaseUserCreationModels.map((model) => this.buildCorporateWithBaseUser(model));

    return await this.corporateEntityRepository.getRepository(entityManager).save(corporatesWithBaseUser);
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveCorporateByUen(uen: string, opts?: ServiceMethodThrowOptions): Promise<Corporate>;
  public async retrieveCorporateByUen(uen: string, opts?: ServiceMethodDontThrowOptions): Promise<Corporate | null>;
  public async retrieveCorporateByUen(uen: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const corporate = await this.corporateEntityRepository.getRepository().findOne({ where: { uen } });

    if (!corporate && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.CORPORATE_ENTITY_SERVICE, Corporate.name, 'uen', uen);
    }

    return corporate;
  }

  public async retrieveCorporateWithBaseUserByUen(uen: string, opts?: ServiceMethodThrowOptions): Promise<Corporate>;
  public async retrieveCorporateWithBaseUserByUen(uen: string, opts?: ServiceMethodDontThrowOptions): Promise<Corporate | null>;
  public async retrieveCorporateWithBaseUserByUen(uen: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const corporate = await this.corporateEntityRepository.getRepository().findOne({ where: { uen }, relations: ['user'] });

    if (!corporate && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.CORPORATE_ENTITY_SERVICE, Corporate.name, 'uen', uen);
    }

    return corporate;
  }
}
