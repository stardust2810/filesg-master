/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CitizenUser, CitizenUserUpdateModel } from '../../../../entities/user';
import { mockCitizenUserEntityRepository } from '../__mocks__/citizen-user.entity.repository.mock';
import {
  mockCitizenUser,
  mockCitizenUserModels,
  mockCitizenUserUuid,
  mockCitizenUserUuid2,
} from '../__mocks__/citizen-user.entity.service.mock';
import { createMockCitizenUser } from '../__mocks__/user.mock';
import { CitizenUserEntityRepository } from '../citizen-user.entity.repository';
import { CitizenUserEntityService } from '../citizen-user.entity.service';

const helpers = require('../../../../utils/helpers');

describe('CitizenUserEntityService', () => {
  let service: CitizenUserEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitizenUserEntityService, { provide: CitizenUserEntityRepository, useValue: mockCitizenUserEntityRepository }],
    }).compile();

    service = module.get<CitizenUserEntityService>(CitizenUserEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildCitizenUser', () => {
    it(`should call getRepository's create function with right params`, () => {
      const citizenUserModel = mockCitizenUserModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockCitizenUserUuid);

      service.buildCitizenUser(citizenUserModel);

      expect(mockCitizenUserEntityRepository.getRepository().create).toBeCalledWith({ uuid: mockCitizenUserUuid, ...citizenUserModel });
    });
  });

  describe('insertCitizenUsers', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedCitizenUsers = mockCitizenUserModels.map((model, index) =>
        createMockCitizenUser({ uuid: `mockCitizenUser-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockCitizenUserUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockCitizenUserUuid2);
      const buildCitizenUserSpy = jest.spyOn(service, 'buildCitizenUser');

      await service.insertCitizenUsers(mockCitizenUserModels);

      mockCitizenUserModels.forEach((model) => expect(buildCitizenUserSpy).toBeCalledWith(model));
      expect(mockCitizenUserEntityRepository.getRepository().insert).toBeCalledWith(expectedCitizenUsers);
    });
  });

  describe('saveCitizenUsers', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedCitizenUsers = mockCitizenUserModels.map((model, index) =>
        createMockCitizenUser({ uuid: `mockCitizenUser-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockCitizenUserUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockCitizenUserUuid2);
      const buildCitizenUserSpy = jest.spyOn(service, 'buildCitizenUser');

      await service.saveCitizenUsers(mockCitizenUserModels);

      mockCitizenUserModels.forEach((model) => expect(buildCitizenUserSpy).toBeCalledWith(model));
      expect(mockCitizenUserEntityRepository.getRepository().save).toBeCalledWith(expectedCitizenUsers);
    });
  });

  describe('saveCitizenUser', () => {
    it(`should call saveCitizenUsers function with a model in array`, async () => {
      const citizenUserModel = mockCitizenUserModels[0];

      const saveCitizenUsersSpy = jest.spyOn(service, 'saveCitizenUsers');

      await service.saveCitizenUser(citizenUserModel);

      expect(saveCitizenUsersSpy).toBeCalledWith([citizenUserModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveCitizenUserById', () => {
    const mockCitizenUserId = 1;

    it('should return user when found', async () => {
      mockCitizenUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockCitizenUser);

      expect(await service.retrieveCitizenUserById(mockCitizenUserId)).toEqual(mockCitizenUser);
      expect(mockCitizenUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { id: mockCitizenUserId } });
    });

    it('should throw EntityNotFoundException when user is not found', async () => {
      mockCitizenUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveCitizenUserById(mockCitizenUserId)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.CITIZEN_USER_SERVICE, CitizenUser.name, 'id', mockCitizenUserId),
      );
      expect(mockCitizenUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { id: mockCitizenUserId } });
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('updateCitizenUserById', () => {
    it(`should call getRepository's update function with right params`, async () => {
      const userId = 1;
      const dataToBeUpdated: CitizenUserUpdateModel = {
        email: 'user-1@gmail.com',
      };

      await service.updateCitizenUserById(userId, dataToBeUpdated);

      expect(mockCitizenUserEntityRepository.getRepository().update).toBeCalledWith({ id: userId }, dataToBeUpdated);
    });
  });
});
