/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException, maskUin } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AgencyUserUpdateModel, CitizenUserUpdateModel, ProgrammaticUserUpdateModel, User } from '../../../../entities/user';
import { mockUserEntityRepository } from '../../../entities/user/__mocks__/user.entity.repository.mock';
import { UserEntityRepository } from '../../../entities/user/user.entity.repository';
import { mockUser, mockUserUuid } from '../__mocks__/user.entity.service.mock';
import { UserEntityService } from '../user.entity.service';

describe('UserEntityService', () => {
  let service: UserEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserEntityService, { provide: UserEntityRepository, useValue: mockUserEntityRepository }],
    }).compile();

    service = module.get<UserEntityService>(UserEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveUserById', () => {
    const mockUserId = 1;

    it('should return user when found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockUser);

      expect(await service.retrieveUserById(mockUserId)).toEqual(mockUser);
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { id: mockUserId } });
    });

    it('should throw EntityNotFoundException when user is not found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveUserById(mockUserId)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'id', mockUserId),
      );
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { id: mockUserId } });
    });
  });

  describe('retrieveUserByUuid', () => {
    it('should return user when found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockUser);

      expect(await service.retrieveUserByUuid(mockUserUuid)).toEqual(mockUser);
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockUserUuid } });
    });

    it('should throw EntityNotFoundException when user is not found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveUserByUuid(mockUserUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'uuid', mockUserUuid),
      );
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockUserUuid } });
    });
  });

  describe('retrieveUserWithEserviceAndAgencyById', () => {
    const mockUserId = 1;

    it('should return user when found', async () => {
      mockUserEntityRepository.findUserWithEserviceAndAgencyById.mockResolvedValueOnce(mockUser);

      expect(await service.retrieveUserWithEserviceAndAgencyById(mockUserId)).toEqual(mockUser);
      expect(mockUserEntityRepository.findUserWithEserviceAndAgencyById).toBeCalledWith(mockUserId, undefined);
    });

    it('should throw EntityNotFoundException when user is not found', async () => {
      mockUserEntityRepository.findUserWithEserviceAndAgencyById.mockResolvedValueOnce(null);

      await expect(service.retrieveUserWithEserviceAndAgencyById(mockUserId)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'id', mockUserId),
      );
      expect(mockUserEntityRepository.findUserWithEserviceAndAgencyById).toBeCalledWith(mockUserId, undefined);
    });
  });

  describe('retrieveUserByUin', () => {
    const userUin = 'S3002607A';

    it('should return user when found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockUser);

      expect(await service.retrieveUserByUin(userUin)).toEqual(mockUser);
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uin: userUin } });
    });

    it('should throw EntityNotFoundException when toThrow set to true and user is not found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveUserByUin(userUin, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'uin', maskUin(userUin)),
      );
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uin: userUin } });
    });

    it('should return null when toThrow set to false and user is not found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(await service.retrieveUserByUin(userUin, { toThrow: false })).toEqual(null);
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uin: userUin } });
    });
  });

  describe('retrieveUserByEmail', () => {
    const userEmail = 'user@gmail.com';

    it('should return user when found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockUser);

      expect(await service.retrieveUserByEmail(userEmail)).toEqual(mockUser);
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { email: userEmail } });
    });

    it('should throw EntityNotFoundException when toThrow set to true and user is not found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveUserByEmail(userEmail, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.USER_SERVICE, User.name, 'email', userEmail),
      );
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { email: userEmail } });
    });

    it('should return null when toThrow set to false and user is not found', async () => {
      mockUserEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(await service.retrieveUserByEmail(userEmail, { toThrow: false })).toEqual(null);
      expect(mockUserEntityRepository.getRepository().findOne).toBeCalledWith({ where: { email: userEmail } });
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('updateUserById', () => {
    it(`should call getRepository's update function with right params`, async () => {
      const userId = 1;
      const dataToBeUpdated: CitizenUserUpdateModel | AgencyUserUpdateModel | ProgrammaticUserUpdateModel = {
        email: 'user-1@gmail.com',
      };

      await service.updateUserById(userId, dataToBeUpdated);

      expect(mockUserEntityRepository.getRepository().update).toBeCalledWith(userId, dataToBeUpdated);
    });
  });
});
