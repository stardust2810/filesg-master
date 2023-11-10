/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException, JWT_TYPE, UnauthorizedRequestException } from '@filesg/backend-common';
import {
  AllFileAssetsFromAgencyResponse,
  COMPONENT_ERROR_CODE,
  FILE_SESSION_TYPE,
  FileDownloadSession,
  SORT_BY,
  STATUS,
  VIEWABLE_FILE_STATUSES,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';

import { AllFileAssetsFromAgencyRequestDto } from '../../../../dtos/file/request';
import { FileAsset } from '../../../../entities/file-asset';
import { mockAuditEventEntityService } from '../../../entities/audit-event/__mocks__/audit-event.entity.service.mock';
import { AuditEventEntityService } from '../../../entities/audit-event/audit-event.entity.service';
import { mockEserviceEntityService } from '../../../entities/eservice/__mocks__/eservice.entity.service.mock';
import { EserviceEntityService } from '../../../entities/eservice/eservice.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import {
  mockFileAssetAccessEntityService,
  mockFileAssetAccessModel,
  mockTokenData,
  mockTokenDataBase64,
} from '../../../entities/file-asset-access/__mocks__/file-asset-access.entity.service.mock';
import { FileAssetAccessEntityService } from '../../../entities/file-asset-access/file-asset-access.entity.service';
import { mockFileAssetHistoryEntityService } from '../../../entities/file-asset-history/__mocks__/file-asset-history.entity.service.mock';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { mockUserEntityService } from '../../../entities/user/__mocks__/user.entity.service.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { UserEntityService } from '../../../entities/user/user.entity.service';
import { FileService } from '../../../features/file/file.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockAuthService } from '../../auth/__mocks__/auth.service.mock';
import { AuthService } from '../../auth/auth.service';
import { mockCitizenUser, mockEservice, mockFileAsset, mockFileAssetUuid, mockUserUuid } from '../__mocks__/file.service.mock';
const helpers = require('../../../../utils/helpers');

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: EserviceEntityService, useValue: mockEserviceEntityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: AuditEventEntityService, useValue: mockAuditEventEntityService },
        { provide: FileAssetAccessEntityService, useValue: mockFileAssetAccessEntityService },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyAccessTokenAndFileSessionAndJwtForDownload', () => {
    it('should be defined', () => {
      expect(service.verifyAccessTokenAndFileSessionAndJwtForDownload).toBeDefined();
    });

    it('should call generateFileSessionAndJwtForDownload if fileAssetUuid matches UserUuid and UserUuid matched Token', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserUuid.mockResolvedValue(mockFileAssetAccessModel);
      mockFileAssetAccessEntityService.verifyTokenBelongsToFileAssetId.mockResolvedValue(mockFileAssetAccessModel);
      jest.spyOn(service, 'generateFileSessionAndJwtForDownload').mockImplementation();

      await service.verifyAccessTokenAndFileSessionAndJwtForDownload(mockTokenDataBase64);
      expect(service.generateFileSessionAndJwtForDownload).toBeCalledTimes(1);
      expect(service.generateFileSessionAndJwtForDownload).toHaveBeenCalledWith(
        [mockFileAssetAccessModel.fileAsset],
        mockTokenData.userUuid,
      );
    });

    it('should Throw unauthorized exception if fileAssetUuid does not matches UserUuid', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserUuid.mockRejectedValue(mockFileAssetAccessModel);
      mockFileAssetAccessEntityService.verifyTokenBelongsToFileAssetId.mockResolvedValue(mockFileAssetAccessModel);
      jest.spyOn(service, 'generateFileSessionAndJwtForDownload').mockImplementation();

      await expect(service.verifyAccessTokenAndFileSessionAndJwtForDownload(mockTokenDataBase64)).rejects.toThrow(
        UnauthorizedRequestException,
      );
    });

    it('should Throw unauthorized exception if fileAssetUuid matches UserUuid and UserUuid does not match Token', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserUuid.mockResolvedValue(mockFileAssetAccessModel);
      mockFileAssetAccessEntityService.verifyTokenBelongsToFileAssetId.mockRejectedValue(mockFileAssetAccessModel);
      jest.spyOn(service, 'generateFileSessionAndJwtForDownload').mockImplementation();

      await expect(service.verifyAccessTokenAndFileSessionAndJwtForDownload(mockTokenDataBase64)).rejects.toThrow(
        UnauthorizedRequestException,
      );
    });
  });

  describe('generateFileSessionAndJwtForDownload', () => {
    it('should be defined', () => {
      expect(service.generateFileSessionAndJwtForDownload).toBeDefined();
    });

    it('should return create file download session and return a jwt', async () => {
      // mock data
      const uuidSpy = jest.spyOn(helpers, 'generateFileSessionUUID');
      const mockFileSessionUuid = 'mockFileSession-uuid-1';
      const mockFileAssetUuids = [mockFileAssetUuid];
      const mockOwnerUuid = mockUserUuid;

      const mockFileDownloadSessionObj: FileDownloadSession = {
        type: FILE_SESSION_TYPE.DOWNLOAD,
        ownerUuid: mockOwnerUuid,
        files: mockFileAssetUuids.map((mockFileAssetUuid) => {
          return {
            id: mockFileAssetUuid,
            name: mockFileAsset.name,
          };
        }),
      };

      // mock return
      mockFileAssetEntityService.retrieveDownloadableFileAssetsByUuidsAndUserUuid.mockResolvedValue([mockFileAsset]);
      uuidSpy.mockReturnValue(mockFileSessionUuid);

      expect(await service.generateFileSessionAndJwtForDownload(mockFileAssetUuids, mockOwnerUuid));
      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.FILE_SESSION,
        mockFileSessionUuid,
        JSON.stringify(mockFileDownloadSessionObj),
      );
      expect(mockAuthService.generateJWT).toBeCalledWith({ fileSessionId: mockFileSessionUuid }, JWT_TYPE.FILE_DOWNLOAD, {
        expiresIn: mockFileSGConfigService.authConfig.jwtDownloadTokenExpirationDuration,
      });

      uuidSpy.mockRestore();
    });
  });

  describe('generateVerifyToken', () => {
    it('should be defined', () => {
      expect(service.generateVerifyToken).toBeDefined();
    });

    it('should generate a verify token', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserUuid.mockResolvedValue(mockFileAsset);
      mockFileAssetAccessEntityService.retrieveTokenUsingFileAssetId.mockResolvedValue(mockFileAssetAccessModel);

      const token = Buffer.from(
        JSON.stringify({
          fileAssetUuid: mockFileAssetUuid,
          userUuid: mockUserUuid,
          token: mockFileAssetAccessModel.token,
        }),
      ).toString('base64');

      expect(await service.generateVerifyToken(mockFileAssetUuid, mockUserUuid)).toEqual({ token });
    });
  });

  describe('retrieveAllFileAssetsFromAgency', () => {
    describe('when called with user in query', () => {
      const mockOwner = createMockCitizenUser({ id: 1001, uin: 'S3002607A', email: 'mock@gmail.com', status: STATUS.ACTIVE });

      const mockQuery: AllFileAssetsFromAgencyRequestDto = {
        user: mockOwner.uin!,
        sortBy: SORT_BY.CREATED_AT,
        asc: false,
        statuses: VIEWABLE_FILE_STATUSES,
      };

      it('should return empty file array if couldnt retrieve user', async () => {
        mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(undefined);
        mockEserviceEntityService.retrieveEserviceByUserId.mockResolvedValueOnce(mockEservice);

        const resp: AllFileAssetsFromAgencyResponse = await service.retrieveAllFileAssetsFromAgency(mockCitizenUser.id, mockQuery);

        expect(mockUserEntityService.retrieveUserByUin).toBeCalled();
        expect(mockUserEntityService.retrieveUserByUin).toBeCalledWith(mockOwner.uin, { toThrow: false });
        expect(mockEserviceEntityService.retrieveEserviceByUserId).not.toBeCalled();

        // Response check
        const { items, count, next } = resp;
        expect(items).toHaveLength(0);
        expect(count).toBe(0);
        expect(next).toBeNull();
      });
    });
  });

  describe('updateLastViewedAt', () => {
    it('should update last viewed at if there is data found', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserId.mockResolvedValue(mockFileAsset);

      await service.updateLastViewedAt(mockFileAsset.uuid, mockFileAsset.ownerId);

      expect(mockFileAssetEntityService.retrieveFileAssetByUuidAndUserId).toBeCalledTimes(1);
      expect(mockFileAssetEntityService.retrieveFileAssetByUuidAndUserId).toBeCalledWith(
        mockFileAsset.uuid,
        mockFileAsset.ownerId,
        undefined,
      );
      expect(mockFileAssetHistoryEntityService.upsertLastViewedAt).toBeCalledTimes(1);
      expect(mockFileAssetHistoryEntityService.upsertLastViewedAt).toBeCalledWith(mockFileAsset.ownerId, mockFileAsset.id);
    });

    it('should update last viewed with activity uuid', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserId.mockResolvedValue(mockFileAsset);

      await service.updateLastViewedAt(mockFileAsset.uuid, mockFileAsset.ownerId, mockFileAsset.uuid);

      expect(mockFileAssetEntityService.retrieveFileAssetByUuidAndUserId).toBeCalledTimes(1);
      expect(mockFileAssetEntityService.retrieveFileAssetByUuidAndUserId).toBeCalledWith(
        mockFileAsset.uuid,
        mockFileAsset.ownerId,
        mockFileAsset.uuid,
      );
      expect(mockFileAssetHistoryEntityService.upsertLastViewedAt).toBeCalledTimes(1);
      expect(mockFileAssetHistoryEntityService.upsertLastViewedAt).toBeCalledWith(mockFileAsset.ownerId, mockFileAsset.id);
    });

    it('should not update last viewed if there is no data', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserId.mockImplementation(() =>
        Promise.reject(new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', mockFileAsset.uuid)),
      );

      await expect(service.updateLastViewedAt(mockFileAsset.uuid, mockFileAsset.ownerId)).rejects.toThrow(
        '[EntityNotFoundException] No FileAsset found with uuid of mockFileAsset-uuid-1',
      );
      expect(mockFileAssetHistoryEntityService.upsertLastViewedAt).not.toBeCalled();
    });
  });
});
