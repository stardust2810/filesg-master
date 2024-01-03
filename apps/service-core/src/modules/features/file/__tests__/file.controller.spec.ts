/* eslint-disable sonarjs/no-duplicate-string */
import { PaginationOptions } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FileAssetAccessToken } from '../../../../dtos/file/request';
import { FileAccess, NonSingpassContentRetrievalRequest, RequestWithCitizenSession } from '../../../../typings/common';
import { mockFileAssetUuid } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { mockFileService } from '../__mocks__/file.service.mock';
import { FileController } from '../file.controller';
import { FileService } from '../file.service';

describe('File Controller', () => {
  let controller: FileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [{ provide: FileService, useValue: mockFileService }],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('download', () => {
    it('should be defined', () => {
      expect(controller.generateDownloadFileToken).toBeDefined();
    });

    it('should call generateFileSessionAndJwtForDownload', () => {
      const mockFileAssetUuids = { uuids: ['mockFileAsset-uuid-1', 'mockFileAsset-uuid-2'] };
      const req = {
        session: {
          user: {
            userUuid: 'mockUser-uuid-1',
          },
        },
      } as RequestWithCitizenSession;
      expect(controller.generateDownloadFileToken(mockFileAssetUuids, req));
      expect(mockFileService.generateFileSessionAndJwtForDownload).toBeCalledWith(mockFileAssetUuids.uuids, req.session.user.userUuid);
    });
  });

  describe('verify/download', () => {
    it('should be defined', () => {
      expect(controller.generateDownloadFileTokenForVerify).toBeDefined();
    });

    it('should call generateFileSessionAndJwtForDownload', () => {
      const mockFileAccess: FileAccess = {
        fileAssetUuid: 'mockFileAsset-uuid-1',
        userUuid: 'mockUser-uuid-1',
        token: 'mockToken',
      };
      const mockVerifyFileRetrievalRequest: FileAssetAccessToken = {
        token: Buffer.from(JSON.stringify(mockFileAccess)).toString('base64'),
      };

      mockFileAccess;

      expect(controller.generateDownloadFileTokenForVerify(mockVerifyFileRetrievalRequest));
      expect(mockFileService.verifyAccessTokenAndFileSessionAndJwtForDownload).toBeCalledWith(mockVerifyFileRetrievalRequest.token);
    });
  });

  describe('/:fileAssetUuid/generate-qr', () => {
    it('should be defined', () => {
      expect(controller.generateVerifyToken).toBeDefined();
    });

    it('should call generateVerifyToken', () => {
      const mockRequest = {
        session: {
          user: {
            userUuid: 'mockUser-uuid-1',
          },
        },
      } as RequestWithCitizenSession;
      expect(controller.generateVerifyToken(mockFileAssetUuid, mockRequest));
      expect(mockFileService.generateVerifyToken).toBeCalledWith(mockFileAssetUuid, mockRequest.session.user.userUuid);
    });
  });

  describe('/recent', () => {
    it('should be defined', () => {
      expect(controller.retrieveRecentFileAssets).toBeDefined();
    });

    it('should call retrieveAllFileAssets', () => {
      const mockRequestWithSession = {
        session: { user: { userId: 1 } },
      } as RequestWithCitizenSession;
      const mockQuery: PaginationOptions = {
        limit: 0,
        page: 0,
      };

      expect(controller.retrieveRecentFileAssets(mockRequestWithSession, mockQuery));
      expect(mockFileService.retrieveRecentFileAssets).toBeCalledWith(mockRequestWithSession.session.user.userId, mockQuery);
    });
  });

  describe('/:fileAssetUuid/non-singpass/generate-qr', () => {
    it('should be defined', () => {
      expect(controller.generateVerifyTokenForNonSingpass).toBeDefined();
    });

    it('should call generateVerifyToken', () => {
      const mockRequest = {
        user: {
          userUuid: 'mockUser-uuid-1',
        },
      } as NonSingpassContentRetrievalRequest;
      expect(controller.generateVerifyTokenForNonSingpass(mockFileAssetUuid, mockRequest));
      expect(mockFileService.generateVerifyToken).toBeCalledWith(mockFileAssetUuid, mockRequest.user.userUuid);
    });
  });

  describe(':fileAssetUuid/lastViewedAt', () => {
    const mockRequestWithSession = {
      session: { user: { userId: 1 } },
    } as RequestWithCitizenSession;

    it('should be defined', () => {
      expect(controller.updateLastViewedAt).toBeDefined();
    });

    it('should call updateLastViewedAt', async () => {
      expect(await controller.updateLastViewedAt(mockFileAssetUuid, mockRequestWithSession));
      expect(mockFileService.updateLastViewedAt).toBeCalledWith(mockFileAssetUuid, mockRequestWithSession.session.user.userId);
    });
  });

  describe('non-singpass/:fileAssetUuid/lastViewedAt', () => {
    const mockRequest = {
      user: {
        userId: 1,
        activityUuid: 'mockUser-activityUuid-1',
      },
    } as NonSingpassContentRetrievalRequest;

    it('should be defined', () => {
      expect(controller.updateNonSingpassLastViewedAt).toBeDefined();
    });

    it('should call updateLastViewedAt', async () => {
      expect(await controller.updateNonSingpassLastViewedAt(mockFileAssetUuid, mockRequest));
      expect(mockFileService.updateLastViewedAt).toBeCalledWith(mockFileAssetUuid, mockRequest.user.userId, mockRequest.user.activityUuid);
    });
  });
});
