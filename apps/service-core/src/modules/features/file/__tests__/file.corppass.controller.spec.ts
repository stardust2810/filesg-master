/* eslint-disable sonarjs/no-duplicate-string */
import { FILE_ASSET_SORT_BY, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AllFileAssetsFromCorporateRequestDto } from '../../../../dtos/file/request';
import { RequestWithCorporateUserSession } from '../../../../typings/common';
import { mockCorppassFileService } from '../__mocks__/file.corppass.service.mock';
import { CorppassFileController } from '../file.corppass.controller';
import { CorppassFileService } from '../file.corppass.service';

describe('Corppass File Controller', () => {
  let controller: CorppassFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorppassFileController],
      providers: [{ provide: CorppassFileService, useValue: mockCorppassFileService }],
    }).compile();

    controller = module.get<CorppassFileController>(CorppassFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('download', () => {
    it('should be defined', () => {
      expect(controller.generateDownloadFileToken).toBeDefined();
    });
  });

  describe('retrieveAllFileAssetUuids', () => {
    it('should be defined', () => {
      expect(controller.retrieveAllFileAssetUuids).toBeDefined();
    });
  });

  describe('retrieveRecentFileAssets', () => {
    it('should be defined', () => {
      expect(controller.retrieveRecentFileAssets).toBeDefined();
    });
    it('should call retrieveRecentFileAssets', () => {
      const mockQuery: AllFileAssetsFromCorporateRequestDto = {
        asc: true,
        sortBy: FILE_ASSET_SORT_BY.LAST_VIEWED_AT,
        statuses: VIEWABLE_FILE_STATUSES,
      };

      const mockRequest = {
        session: {
          user: {
            userUuid: 'mockUser-uuid-1',
          },
        },
      } as RequestWithCorporateUserSession;

      controller.retrieveRecentFileAssets(mockRequest, mockQuery);
      expect(mockCorppassFileService.retrieveRecentFileAssets).toBeCalledWith(mockRequest.session.user, mockQuery);
    });
  });

  describe('updateLastViewedAt', () => {
    it('should be defined', () => {
      expect(controller.updateLastViewedAt).toBeDefined();
    });
  });

  describe('retrieveFileHistory', () => {
    it('should be defined', () => {
      expect(controller.retrieveFileHistory).toBeDefined();
    });
  });
});
