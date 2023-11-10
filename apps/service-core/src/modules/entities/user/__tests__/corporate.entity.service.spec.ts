/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, ROLE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Corporate } from '../../../../entities/corporate';
import { mockDatabaseTransaction } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { mockCorporateEntityRepository } from '../__mocks__/corporate/corporate.entity.repository.mock';
import {
  mockCorporate1,
  mockCorporate2,
  mockCorporateCreationModel1,
  mockCorporateCreationModel2,
  mockCorporateUen1,
  mockCorporateUuid1,
  mockCorporateWithBaseUser1,
  mockCorporateWithBaseUser2,
  mockCorporateWithBaseUserCreationModel1,
  mockCorporateWithBaseUserCreationModel2,
} from '../__mocks__/corporate/corporate.entity.service.mock';
import { CorporateEntityRepository } from '../corporate/corporate.entity.repository';
import { CorporateEntityService } from '../corporate/corporate.entity.service';

const helpers = require('../../../../utils/helpers');

describe('CorporateEntityService', () => {
  const { entityManager } = mockDatabaseTransaction;
  let service: CorporateEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorporateEntityService, { provide: CorporateEntityRepository, useValue: mockCorporateEntityRepository }],
    }).compile();

    service = module.get<CorporateEntityService>(CorporateEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildCorporate', () => {
    it('should be defined', () => {
      expect(service.buildCorporate).toBeDefined();
    });

    it('should call correct methods with correct args', () => {
      service.buildCorporate(mockCorporateCreationModel1);

      expect(mockCorporateEntityRepository.getRepository().create).toBeCalledWith(mockCorporateCreationModel1);
    });
  });

  describe('buildCorporateWithBaseUser', () => {
    it('should be defined', () => {
      expect(service.buildCorporateWithBaseUser).toBeDefined();
    });

    it('should call correct methods with correct args', () => {
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockCorporateUuid1);

      const { user } = mockCorporateWithBaseUserCreationModel1;

      service.buildCorporateWithBaseUser(mockCorporateWithBaseUserCreationModel1);

      expect(mockCorporateEntityRepository.getRepository().create).toBeCalledWith({
        ...mockCorporateWithBaseUserCreationModel1,
        user: {
          uuid: mockCorporateUuid1,
          role: ROLE.CORPORATE,
          ...user,
        },
      });
    });
  });

  describe('insertCorporates', () => {
    it('should be defined', () => {
      expect(service.insertCorporates).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      const buildCorporateSpy = jest.spyOn(service, 'buildCorporate');

      buildCorporateSpy.mockReturnValueOnce(mockCorporate1).mockReturnValueOnce(mockCorporate2);

      await service.insertCorporates([mockCorporateCreationModel1, mockCorporateCreationModel2], entityManager);

      expect(buildCorporateSpy).nthCalledWith(1, mockCorporateCreationModel1);
      expect(buildCorporateSpy).nthCalledWith(2, mockCorporateCreationModel2);
      expect(mockCorporateEntityRepository.getRepository).toBeCalledWith(entityManager);
      expect(mockCorporateEntityRepository.getRepository(entityManager).insert).toBeCalledWith([mockCorporate1, mockCorporate2]);
    });
  });

  describe('saveCorporates', () => {
    it('should be defined', () => {
      expect(service.saveCorporates).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      const buildCorporateSpy = jest.spyOn(service, 'buildCorporate');

      buildCorporateSpy.mockReturnValueOnce(mockCorporate1).mockReturnValueOnce(mockCorporate2);

      await service.saveCorporates([mockCorporateCreationModel1, mockCorporateCreationModel2], entityManager);

      expect(buildCorporateSpy).nthCalledWith(1, mockCorporateCreationModel1);
      expect(buildCorporateSpy).nthCalledWith(2, mockCorporateCreationModel2);
      expect(mockCorporateEntityRepository.getRepository).toBeCalledWith(entityManager);
      expect(mockCorporateEntityRepository.getRepository(entityManager).save).toBeCalledWith([mockCorporate1, mockCorporate2]);
    });
  });

  describe('saveCorporateWithBaseUser', () => {
    it('should be defined', () => {
      expect(service.saveCorporateWithBaseUser).toBeDefined();
    });

    it('should call saveCorporatesWithBaseUsers with the right params', async () => {
      const saveCorporatesWithBaseUsersSpy = jest.spyOn(service, 'saveCorporatesWithBaseUsers');

      await service.saveCorporateWithBaseUser(mockCorporateWithBaseUserCreationModel1);

      expect(saveCorporatesWithBaseUsersSpy).toBeCalledWith([mockCorporateWithBaseUserCreationModel1], undefined);
    });
  });

  describe('saveCorporatesWithBaseUsers', () => {
    it('should be defined', () => {
      expect(service.saveCorporatesWithBaseUsers).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      const buildCorporateWithBaseUserSpy = jest.spyOn(service, 'buildCorporateWithBaseUser');

      buildCorporateWithBaseUserSpy.mockReturnValueOnce(mockCorporateWithBaseUser1).mockReturnValueOnce(mockCorporateWithBaseUser2);

      await service.saveCorporatesWithBaseUsers(
        [mockCorporateWithBaseUserCreationModel1, mockCorporateWithBaseUserCreationModel2],
        entityManager,
      );

      expect(buildCorporateWithBaseUserSpy).nthCalledWith(1, mockCorporateWithBaseUserCreationModel1);
      expect(buildCorporateWithBaseUserSpy).nthCalledWith(2, mockCorporateWithBaseUserCreationModel2);
      expect(mockCorporateEntityRepository.getRepository).toBeCalledWith(entityManager);
      expect(mockCorporateEntityRepository.getRepository(entityManager).save).toBeCalledWith([
        mockCorporateWithBaseUser1,
        mockCorporateWithBaseUser2,
      ]);
    });

    // =========================================================================
    // Retrieve
    // =========================================================================
    describe('retrieveCorporateByUen', () => {
      it('should be defined', () => {
        expect(service.retrieveCorporateByUen).toBeDefined();
      });

      it('should return corporate when found', async () => {
        mockCorporateEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockCorporate1);

        expect(await service.retrieveCorporateByUen(mockCorporateUen1)).toEqual(mockCorporate1);
        expect(mockCorporateEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uen: mockCorporateUen1 } });
      });

      it('should throw EntityNotFoundException when toThrow set to true and corporate is not found', async () => {
        mockCorporateEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

        await expect(service.retrieveCorporateByUen(mockCorporateUen1, { toThrow: true })).rejects.toThrowError(
          new EntityNotFoundException(COMPONENT_ERROR_CODE.CORPORATE_ENTITY_SERVICE, Corporate.name, 'uen', mockCorporateUen1),
        );
        expect(mockCorporateEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uen: mockCorporateUen1 } });
      });

      it('should return null when toThrow set to false and corporate is not found', async () => {
        mockCorporateEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

        expect(await service.retrieveCorporateByUen(mockCorporateUen1, { toThrow: false })).toEqual(null);
        expect(mockCorporateEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uen: mockCorporateUen1 } });
      });
    });
  });
});
