/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException, InputValidationException, JWT_TYPE, UnauthorizedRequestException } from '@filesg/backend-common';
import {
  AllFileAssetsFromAgencyResponse,
  COMPONENT_ERROR_CODE,
  FILE_ASSET_SORT_BY,
  FILE_SESSION_TYPE,
  FileDownloadInfo,
  FileDownloadSession,
  PaginationOptions,
  STATUS,
  VIEWABLE_FILE_STATUSES,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';

import { InvalidFileTypeForQrGenerationException } from '../../../../common/filters/custom-exceptions.filter';
import { AllFileAssetsFromAgencyRequestDto } from '../../../../dtos/file/request';
import { FileAsset } from '../../../../entities/file-asset';
import { mockEserviceEntityService, mockEserviceUuid } from '../../../entities/eservice/__mocks__/eservice.entity.service.mock';
import { EserviceEntityService } from '../../../entities/eservice/eservice.entity.service';
import {
  mockFileAssetEntityService,
  mockFileAssets,
  mockFileAssetsWithActivities,
  mockFileAssetUuids,
  mockFileAssetWithActivity,
  mockFileAssetWithUnAcknowledgedActivity,
} from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
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
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockAuthService } from '../../auth/__mocks__/auth.service.mock';
import { AuthService } from '../../auth/auth.service';
import { mockUserUin } from '../../queue-handler/__mocks__/transactional-email-handler.service.mock';
import { mockUser } from '../../user/__mocks__/user.service.mock';
import {
  mockCitizenUser,
  mockEservice,
  mockFileAsset,
  mockFileAsset2,
  mockFileAssetRequireAcknowledgement,
  mockFileAssetUuid,
  mockFileAssetUuid2,
  mockFileDownloadSessionObj,
  mockFileName,
  mockFileName2,
  mockFileSessionUuid,
  mockUserUuid,
  TestFileService,
} from '../__mocks__/file.service.mock';
const helpers = require('../../../../utils/helpers');

describe('FileService', () => {
  let service: TestFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFileService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: EserviceEntityService, useValue: mockEserviceEntityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: FileAssetAccessEntityService, useValue: mockFileAssetAccessEntityService },
      ],
    }).compile();

    service = module.get<TestFileService>(TestFileService);
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
      expect(service.generateFileSessionAndJwtForDownload).toHaveBeenCalledWith([mockTokenData.fileAssetUuid], mockTokenData.userUuid);
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

    it('should call methods with the right params', async () => {
      const mockFileAssetUuids = [mockFileAssetUuid];
      const mockFileAssets = [mockFileAsset];
      const mockDownloadToken = 'mockDownloadToken';

      const infoOfFilesToBeDownloaded: FileDownloadInfo[] = mockFileAssets.map((fileAsset) => {
        return { id: fileAsset.uuid, name: fileAsset.name };
      });

      mockFileAssetEntityService.retrieveDownloadableFileAssetsByUuidsAndUserUuid.mockResolvedValueOnce(mockFileAssets);

      const validateIfFileAssetsActivityAcknowledgedSpy = jest.spyOn(service, 'validateIfFileAssetsActivityAcknowledged');
      validateIfFileAssetsActivityAcknowledgedSpy.mockReturnThis();

      const validateMissingFileAssetsSpy = jest.spyOn(service, 'validateMissingFileAssets');
      validateMissingFileAssetsSpy.mockReturnThis();

      const generateFileDownloadSessionSpy = jest.spyOn(service, 'generateFileDownloadSession');
      generateFileDownloadSessionSpy.mockReturnValueOnce(mockFileDownloadSessionObj);

      const generateFileAssetDownloadJWTSpy = jest.spyOn(service, 'generateFileAssetDownloadJWT');
      generateFileAssetDownloadJWTSpy.mockResolvedValueOnce(mockDownloadToken);

      expect(await service.generateFileSessionAndJwtForDownload(mockFileAssetUuids, mockUserUuid)).toEqual({ token: mockDownloadToken });

      expect(mockFileAssetEntityService.retrieveDownloadableFileAssetsByUuidsAndUserUuid).toBeCalledWith(
        mockFileAssetUuids,
        mockUserUuid,
        undefined,
        undefined,
      );

      expect(validateIfFileAssetsActivityAcknowledgedSpy).toBeCalledWith(mockFileAssets);
      expect(validateMissingFileAssetsSpy).toBeCalledWith(infoOfFilesToBeDownloaded, mockFileAssetUuids);
      expect(generateFileDownloadSessionSpy).toBeCalledWith(mockUserUuid, infoOfFilesToBeDownloaded);
      expect(generateFileAssetDownloadJWTSpy).toBeCalledWith(mockFileDownloadSessionObj);
    });
  });

  describe('generateVerifyToken', () => {
    it('should be defined', () => {
      expect(service.generateVerifyToken).toBeDefined();
    });

    it('should generate a verify token', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserUuid.mockResolvedValue(mockFileAsset2);
      mockFileAssetAccessEntityService.retrieveTokenUsingFileAssetId.mockResolvedValue(mockFileAssetAccessModel);

      const token = Buffer.from(
        JSON.stringify({
          fileAssetUuid: mockFileAssetUuid2,
          userUuid: mockUserUuid,
          token: mockFileAssetAccessModel.token,
        }),
      ).toString('base64');

      expect(await service.generateVerifyToken(mockFileAssetUuid2, mockUserUuid)).toEqual({ token });
    });

    it('should throw InvalidFileTypeForQrGenerationException when file asset is not of type oa', async () => {
      mockFileAssetEntityService.retrieveFileAssetByUuidAndUserUuid.mockResolvedValue(mockFileAsset);

      await expect(service.generateVerifyToken(mockFileAssetUuid, mockUserUuid)).rejects.toThrowError(
        new InvalidFileTypeForQrGenerationException(COMPONENT_ERROR_CODE.FILE_SERVICE),
      );
    });
  });

  describe('retrieveRecentFileAssets', () => {
    const mockQuery: PaginationOptions = {
      limit: 0,
      page: 0,
    };
    it('should call with the right params', () => {
      jest.spyOn(mockFileAssetEntityService, 'retrieveRecentFileAssets').mockResolvedValue([mockFileAsset]);
      service.retrieveRecentFileAssets(mockCitizenUser.id, mockQuery);
      expect(mockFileAssetEntityService.retrieveRecentFileAssets).toBeCalledWith({
        ...mockQuery,
        ownerId: mockCitizenUser.id,
      });
      expect(mockFileAssetEntityService.retrieveRecentFileAssets).toBeCalledTimes(1);
    });
  });

  describe('retrieveAllFileAssetsFromAgency', () => {
    describe('when called with user in query', () => {
      const mockOwner = createMockCitizenUser({ id: 1001, uin: 'S3002607A', email: 'mock@gmail.com', status: STATUS.ACTIVE });

      const mockQuery: AllFileAssetsFromAgencyRequestDto = {
        user: mockOwner.uin!,
        sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
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

  describe('generateFileDownloadTokenForEservice', () => {
    it('should return a jwt token for the fileasset when calling without user uin', async () => {
      mockFileAssetEntityService.retrieveAgencyFileAssetByRecipientFileAssetUuidAndEserviceUserUuid.mockResolvedValueOnce(
        mockFileAssetsWithActivities,
      );
      jest.spyOn(service, 'generateFileAssetDownloadJWT').mockImplementation();
      const fileDownloadSession: FileDownloadSession = {
        ownerUuid: mockEserviceUuid,
        isAgencyDownload: true,
        type: FILE_SESSION_TYPE.DOWNLOAD,
        files: mockFileAssetsWithActivities.map(({ uuid, name }) => ({ id: uuid, name })),
      };

      await service.generateFileDownloadTokenForAgency(mockEserviceUuid, mockFileAssetUuids);
      expect(service.generateFileAssetDownloadJWT).toBeCalledTimes(1);
      expect(service.generateFileAssetDownloadJWT).toBeCalledWith(fileDownloadSession);
    });

    it('should return a jwt token for the fileasset without duplicates', async () => {
      mockFileAssetEntityService.retrieveAgencyFileAssetByRecipientFileAssetUuidAndEserviceUserUuid.mockResolvedValueOnce([
        mockFileAssetWithActivity,
        mockFileAssetWithActivity,
      ]);
      jest.spyOn(service, 'generateFileAssetDownloadJWT').mockImplementation();
      const fileDownloadSession: FileDownloadSession = {
        ownerUuid: mockEserviceUuid,
        isAgencyDownload: true,
        type: FILE_SESSION_TYPE.DOWNLOAD,
        files: [{ id: mockFileAssetWithActivity.uuid, name: mockFileAssetWithActivity.name }],
      };

      await service.generateFileDownloadTokenForAgency(mockEserviceUuid, mockFileAssetUuids);
      expect(service.generateFileAssetDownloadJWT).toBeCalledTimes(1);
      expect(service.generateFileAssetDownloadJWT).toBeCalledWith(fileDownloadSession);
    });

    it('should return a jwt token for the fileasset when calling with user uin', async () => {
      mockFileAssetEntityService.retrieveFileAssetByFileAssetUuidAndUserId.mockResolvedValueOnce(mockFileAssetsWithActivities);
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUser);
      jest.spyOn(service, 'generateFileAssetDownloadJWT').mockImplementation();
      const fileDownloadSession: FileDownloadSession = {
        ownerUuid: mockUser.uuid,
        isAgencyDownload: true,
        type: FILE_SESSION_TYPE.DOWNLOAD,
        files: mockFileAssets.map(({ uuid, name }) => ({ id: uuid, name })),
      };

      await service.generateFileDownloadTokenForAgency(mockEserviceUuid, mockFileAssetUuids, mockUserUin);
      expect(service.generateFileAssetDownloadJWT).toBeCalledTimes(1);
      expect(service.generateFileAssetDownloadJWT).toBeCalledWith(fileDownloadSession);
    });

    it('should throw error when agency tries to download user file which is not acknowledged', async () => {
      mockFileAssetEntityService.retrieveFileAssetByFileAssetUuidAndUserId.mockResolvedValueOnce([mockFileAssetWithUnAcknowledgedActivity]);
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUser);

      await expect(service.generateFileDownloadTokenForAgency(mockEserviceUuid, mockFileAssetUuids, mockUserUin)).rejects.toThrowError(
        InputValidationException,
      );
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

  describe('generateFileAssetDownloadJWT', () => {
    it('should call methods with the right args', async () => {
      const uuidSpy = jest.spyOn(helpers, 'generateFileSessionUUID');
      uuidSpy.mockReturnValue(mockFileSessionUuid);

      await service.generateFileAssetDownloadJWT(mockFileDownloadSessionObj);

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

  describe('validateIfFileAssetsActivityAcknowledged', () => {
    it('should return void when all file assets are acknowledged', () => {
      expect(service.validateIfFileAssetsActivityAcknowledged([mockFileAsset])).toBe(undefined);
    });

    it('should throw InputValidationException when any file asset is not acknowledged', () => {
      expect(() => service.validateIfFileAssetsActivityAcknowledged([mockFileAsset, mockFileAssetRequireAcknowledgement])).toThrow(
        InputValidationException,
      );
    });
  });

  describe('validateMissingFileAssets', () => {
    const fileAssetUuidsFromQuery = [mockFileAssetUuid, mockFileAssetUuid2];

    it('should return void when all files asset uuids from query are the same as queried file assets (to be downloaded)', () => {
      const infoOfFilesToBeDownloaded: FileDownloadInfo[] = [
        { id: mockFileAssetUuid, name: mockFileName },
        { id: mockFileAssetUuid2, name: mockFileName2 },
      ];

      expect(service.validateMissingFileAssets(infoOfFilesToBeDownloaded, fileAssetUuidsFromQuery)).toBe(undefined);
    });

    it('should throw EntityNotFoundException when file asset uuids from query does not match queried file assets (to be downloaded)', () => {
      const infoOfFilesToBeDownloaded: FileDownloadInfo[] = [{ id: mockFileAssetUuid, name: mockFileName }];

      const missingUuids = [mockFileAssetUuid2];

      expect(() => service.validateMissingFileAssets(infoOfFilesToBeDownloaded, fileAssetUuidsFromQuery)).toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, 'file asset', 'uuid', missingUuids.join(', ')),
      );
    });
  });
});
