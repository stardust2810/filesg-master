/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ProgrammaticUser } from '../../../../entities/user';
import { mockProgrammaticUserEntityRepository } from '../__mocks__/programmatic-user.entity.repository.mock';
import {
  mockProgrammaticUser,
  mockProgrammaticUser2,
  mockProgrammaticUserModels,
  mockProgrammaticUserUuid,
  mockProgrammaticUserUuid2,
} from '../__mocks__/programmatic-user.entity.service.mock';
import { createMockProgrammaticUser } from '../__mocks__/user.mock';
import { ProgrammaticUserEntityRepository } from '../programmatic-user.entity.repository';
import { ProgrammaticUserEntityService } from '../programmatic-user.entity.service';

const helpers = require('../../../../utils/helpers');

describe('ProgrammaticUserEntityService', () => {
  let service: ProgrammaticUserEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgrammaticUserEntityService,
        { provide: ProgrammaticUserEntityRepository, useValue: mockProgrammaticUserEntityRepository },
      ],
    }).compile();

    service = module.get<ProgrammaticUserEntityService>(ProgrammaticUserEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildProgrammaticUser', () => {
    it(`should call getRepository's create function with right params`, () => {
      const programmaticUserModel = mockProgrammaticUserModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockProgrammaticUserUuid);

      service.buildProgrammaticUser(programmaticUserModel);

      expect(mockProgrammaticUserEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockProgrammaticUserUuid,
        ...programmaticUserModel,
      });
    });
  });

  describe('insertProgrammaticUsers', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedProgrammaticUsers = mockProgrammaticUserModels.map((model, index) =>
        createMockProgrammaticUser({ uuid: `mockProgrammaticUser-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockProgrammaticUserUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockProgrammaticUserUuid2);
      const buildProgrammaticUserSpy = jest.spyOn(service, 'buildProgrammaticUser');

      await service.insertProgrammaticUsers(mockProgrammaticUserModels);

      mockProgrammaticUserModels.forEach((model) => expect(buildProgrammaticUserSpy).toBeCalledWith(model));
      expect(mockProgrammaticUserEntityRepository.getRepository().insert).toBeCalledWith(expectedProgrammaticUsers);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveProgrammaticUserByClientId', () => {
    const mockClientId = 'mockClientId';

    it('should return programmaticUser when found', async () => {
      mockProgrammaticUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockProgrammaticUser);

      expect(await service.retrieveProgrammaticUserByClientId(mockClientId)).toEqual(mockProgrammaticUser);
      expect(mockProgrammaticUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { clientId: mockClientId } });
    });

    it('should throw EntityNotFoundException when toThrow set to true and programmaticUser is not found', async () => {
      mockProgrammaticUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveProgrammaticUserByClientId(mockClientId, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.PROGRAMMATIC_USER_SERVICE, ProgrammaticUser.name, 'clientId', mockClientId),
      );
      expect(mockProgrammaticUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { clientId: mockClientId } });
    });

    it('should return null when toThrow set to false and programmaticUser is not found', async () => {
      mockProgrammaticUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(await service.retrieveProgrammaticUserByClientId(mockClientId, { toThrow: false })).toEqual(null);
      expect(mockProgrammaticUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { clientId: mockClientId } });
    });
  });

  describe('retrieveAllEservicesProgrammaticUsersByUserId', () => {
    const mockUserId = 1;

    it('should return programmaticUser when found', async () => {
      mockProgrammaticUserEntityRepository.findAllEservicesProgrammaticUsersByUserId.mockResolvedValueOnce(mockProgrammaticUser);

      expect(await service.retrieveAllEservicesProgrammaticUsersByUserId(mockUserId)).toEqual([mockProgrammaticUser2]);
      expect(mockProgrammaticUserEntityRepository.findAllEservicesProgrammaticUsersByUserId).toBeCalledWith(mockUserId, undefined);
    });

    it('should throw EntityNotFoundException when programmaticUser is not found', async () => {
      mockProgrammaticUserEntityRepository.findAllEservicesProgrammaticUsersByUserId.mockResolvedValueOnce(null);

      await expect(service.retrieveAllEservicesProgrammaticUsersByUserId(mockUserId)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.PROGRAMMATIC_USER_SERVICE, ProgrammaticUser.name, 'userId', mockUserId),
      );

      expect(mockProgrammaticUserEntityRepository.findAllEservicesProgrammaticUsersByUserId).toBeCalledWith(mockUserId, undefined);
    });
  });
});
