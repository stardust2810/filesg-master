/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, ROLE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CorporateUser, CorporateUserUpdateModel } from '../../../../entities/corporate-user';
import { mockDatabaseTransaction } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { mockCorporateUserEntityRepository } from '../__mocks__/corporate-user/corporate-user.entity.repository.mock';
import {
  mockCorporate1,
  mockCorporateId1,
  mockCorporateUser1,
  mockCorporateUser2,
  mockCorporateUserCreationModel1,
  mockCorporateUserCreationModel2,
  mockCorporateUserUin1,
  mockCorporateUserUuid1,
  mockCorporateUserWithBaseUser1,
  mockCorporateUserWithBaseUser2,
  mockCorporateUserWithBaseUserCreationModel1,
  mockCorporateUserWithBaseUserCreationModel2,
} from '../__mocks__/corporate-user/corporate-user.entity.service.mock';
import { CorporateUserEntityRepository } from '../corporate-user/corporate-user.entity.repository';
import { CorporateUserEntityService } from '../corporate-user/corporate-user.entity.service';

const helpers = require('../../../../utils/helpers');

describe('CorporateUserEntityService', () => {
  const { entityManager } = mockDatabaseTransaction;
  let service: CorporateUserEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorporateUserEntityService, { provide: CorporateUserEntityRepository, useValue: mockCorporateUserEntityRepository }],
    }).compile();

    service = module.get<CorporateUserEntityService>(CorporateUserEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildCorporateUser', () => {
    it('should be defined', () => {
      expect(service.buildCorporateUser).toBeDefined();
    });

    it('should call correct methods with correct args', () => {
      service.buildCorporateUser(mockCorporateUserCreationModel1);

      expect(mockCorporateUserEntityRepository.getRepository().create).toBeCalledWith(mockCorporateUserCreationModel1);
    });
  });

  describe('buildCorporateUserWithBaseUser', () => {
    it('should be defined', () => {
      expect(service.buildCorporateUserWithBaseUser).toBeDefined();
    });

    it('should call correct methods with correct args', () => {
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockCorporateUserUuid1);

      const { user } = mockCorporateUserWithBaseUserCreationModel1;

      service.buildCorporateUserWithBaseUser(mockCorporateUserWithBaseUserCreationModel1);

      expect(mockCorporateUserEntityRepository.getRepository().create).toBeCalledWith({
        ...mockCorporateUserWithBaseUserCreationModel1,
        user: {
          uuid: mockCorporateUserUuid1,
          role: ROLE.CORPORATE_USER,
          ...user,
        },
      });
    });
  });

  describe('insertCorporateUsers', () => {
    it('should be defined', () => {
      expect(service.insertCorporateUsers).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      const buildCorporateUserSpy = jest.spyOn(service, 'buildCorporateUser');

      buildCorporateUserSpy.mockReturnValueOnce(mockCorporateUser1).mockReturnValueOnce(mockCorporateUser2);

      await service.insertCorporateUsers([mockCorporateUserCreationModel1, mockCorporateUserCreationModel2], entityManager);

      expect(buildCorporateUserSpy).nthCalledWith(1, mockCorporateUserCreationModel1);
      expect(buildCorporateUserSpy).nthCalledWith(2, mockCorporateUserCreationModel2);
      expect(mockCorporateUserEntityRepository.getRepository).toBeCalledWith(entityManager);
      expect(mockCorporateUserEntityRepository.getRepository(entityManager).insert).toBeCalledWith([
        mockCorporateUser1,
        mockCorporateUser2,
      ]);
    });
  });

  describe('saveCorporateUsers', () => {
    it('should be defined', () => {
      expect(service.saveCorporateUsers).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      const buildCorporateUserSpy = jest.spyOn(service, 'buildCorporateUser');

      buildCorporateUserSpy.mockReturnValueOnce(mockCorporateUser1).mockReturnValueOnce(mockCorporateUser2);

      await service.saveCorporateUsers([mockCorporateUserCreationModel1, mockCorporateUserCreationModel2], entityManager);

      expect(buildCorporateUserSpy).nthCalledWith(1, mockCorporateUserCreationModel1);
      expect(buildCorporateUserSpy).nthCalledWith(2, mockCorporateUserCreationModel2);
      expect(mockCorporateUserEntityRepository.getRepository).toBeCalledWith(entityManager);
      expect(mockCorporateUserEntityRepository.getRepository(entityManager).save).toBeCalledWith([mockCorporateUser1, mockCorporateUser2]);
    });
  });

  describe('saveCorporateUserWithBaseUser', () => {
    it('should be defined', () => {
      expect(service.saveCorporateUserWithBaseUser).toBeDefined();
    });

    it('should call saveCorporateUsersWithBaseUsers with the right params', async () => {
      const saveCorporateUsersWithBaseUsersSpy = jest.spyOn(service, 'saveCorporateUsersWithBaseUsers');

      await service.saveCorporateUserWithBaseUser(mockCorporateUserWithBaseUserCreationModel1);

      expect(saveCorporateUsersWithBaseUsersSpy).toBeCalledWith([mockCorporateUserWithBaseUserCreationModel1], undefined);
    });
  });

  describe('saveCorporateUsersWithBaseUsers', () => {
    it('should be defined', () => {
      expect(service.saveCorporateUsersWithBaseUsers).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      const buildCorporateUserWithBaseUserSpy = jest.spyOn(service, 'buildCorporateUserWithBaseUser');

      buildCorporateUserWithBaseUserSpy
        .mockReturnValueOnce(mockCorporateUserWithBaseUser1)
        .mockReturnValueOnce(mockCorporateUserWithBaseUser2);

      await service.saveCorporateUsersWithBaseUsers(
        [mockCorporateUserWithBaseUserCreationModel1, mockCorporateUserWithBaseUserCreationModel2],
        entityManager,
      );

      expect(buildCorporateUserWithBaseUserSpy).nthCalledWith(1, mockCorporateUserWithBaseUserCreationModel1);
      expect(buildCorporateUserWithBaseUserSpy).nthCalledWith(2, mockCorporateUserWithBaseUserCreationModel2);
      expect(mockCorporateUserEntityRepository.getRepository).toBeCalledWith(entityManager);
      expect(mockCorporateUserEntityRepository.getRepository(entityManager).save).toBeCalledWith([
        mockCorporateUserWithBaseUser1,
        mockCorporateUserWithBaseUser2,
      ]);
    });
  });

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  describe('retrieveCorporateUserWithBaseUserByUinAndCorporateId', () => {
    it('should be defined', () => {
      expect(service.retrieveCorporateUserWithBaseUserByUinAndCorporateId).toBeDefined();
    });

    it('should return corporate user when found', async () => {
      mockCorporateUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockCorporateUser1);

      expect(await service.retrieveCorporateUserWithBaseUserByUinAndCorporateId(mockCorporateUserUin1, mockCorporate1.id)).toEqual(
        mockCorporateUser1,
      );
      expect(mockCorporateUserEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uin: mockCorporateUserUin1, corporateId: mockCorporateId1 },
        relations: ['user'],
      });
    });

    it('should throw EntityNotFoundException when toThrow set to true and corporate user is not found', async () => {
      mockCorporateUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(
        service.retrieveCorporateUserWithBaseUserByUinAndCorporateId(mockCorporateUserUin1, mockCorporate1.id, { toThrow: true }),
      ).rejects.toThrowError(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.CORPORATE_USER_ENTITY_SERVICE,
          CorporateUser.name,
          'uin and corporateId',
          `${mockCorporateUserUin1} and ${mockCorporateId1}`,
        ),
      );
      expect(mockCorporateUserEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uin: mockCorporateUserUin1, corporateId: mockCorporateId1 },
        relations: ['user'],
      });
    });

    it('should return null when toThrow set to false and corporate is not found', async () => {
      mockCorporateUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(
        await service.retrieveCorporateUserWithBaseUserByUinAndCorporateId(mockCorporateUserUin1, mockCorporate1.id, {
          toThrow: false,
        }),
      ).toEqual(null);
      expect(mockCorporateUserEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uin: mockCorporateUserUin1, corporateId: mockCorporateId1 },
        relations: ['user'],
      });
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('updateCorporateUserById', () => {
    it(`should call getRepository's update function with right params`, async () => {
      const mockId = 1;
      const dataToBeUpdated: CorporateUserUpdateModel = {
        name: 'new name',
      };

      await service.updateCorporateUserById(mockId, dataToBeUpdated);
      expect(mockCorporateUserEntityRepository.getRepository().update).toBeCalledWith({ id: mockId }, dataToBeUpdated);
    });
  });
});
