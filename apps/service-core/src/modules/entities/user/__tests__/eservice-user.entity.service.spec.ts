import { Test, TestingModule } from '@nestjs/testing';

import { mockEserviceUserEntityRepository } from '../__mocks__/eservice-user.entity.repository.mock';
import {
  mockEserviceUser,
  mockEserviceUser2,
  mockEserviceUserModels,
  mockEserviceWhitelistedUser,
} from '../__mocks__/eservice-user.entity.service.mock';
import { createMockEserviceUser } from '../__mocks__/user.mock';
import { EserviceUserEntityRepository } from '../eservice-user.entity.repository';
import { EserviceUserEntityService } from '../eservice-user.entity.service';

const helpers = require('../../../../utils/helpers');

describe('EserviceUserEntityService', () => {
  let service: EserviceUserEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EserviceUserEntityService, { provide: EserviceUserEntityRepository, useValue: mockEserviceUserEntityRepository }],
    }).compile();

    service = module.get<EserviceUserEntityService>(EserviceUserEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildEserviceUser', () => {
    it(`should call getRepository's create function with right params`, () => {
      const eserviceUserModel = mockEserviceUserModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUser.uuid);

      service.buildEserviceUser(eserviceUserModel);

      expect(mockEserviceUserEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockEserviceUser.uuid,
        ...eserviceUserModel,
      });
    });
  });

  describe('insertEserviceUsers', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedEserviceUsers = mockEserviceUserModels.map((model, index) =>
        createMockEserviceUser({ uuid: `mockEserviceUser-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUser.uuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUser2.uuid);
      const buildEserviceUserSpy = jest.spyOn(service, 'buildEserviceUser');

      await service.insertEserviceUsers(mockEserviceUserModels);

      mockEserviceUserModels.forEach((model) => expect(buildEserviceUserSpy).toBeCalledWith(model));
      expect(mockEserviceUserEntityRepository.getRepository().insert).toBeCalledWith(expectedEserviceUsers);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('findEserviceUserByActiveWhitelistEmail', () => {
    it('should return eserviceUser when found', async () => {
      mockEserviceUserEntityRepository.findEserviceUserByActiveWhitelistEmail.mockResolvedValueOnce(mockEserviceUser);

      expect(await service.retrieveEserviceUserByActiveWhitelistEmail(mockEserviceWhitelistedUser.email)).toEqual(mockEserviceUser);
      expect(mockEserviceUserEntityRepository.findEserviceUserByActiveWhitelistEmail).toBeCalledWith(
        mockEserviceWhitelistedUser.email
      );
    });
  });
});
