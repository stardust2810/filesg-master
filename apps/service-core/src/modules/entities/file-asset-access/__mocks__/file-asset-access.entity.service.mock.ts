import { MockService } from '../../../../typings/common.mock';
import { mockFileAsset } from '../../file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetAccessEntityService } from '../file-asset-access.entity.service';
import { createMockFileAssetAccess } from './file-asset-access.mock';

export const mockFileAssetAccessEntityService: MockService<FileAssetAccessEntityService> = {
  buildFileAssetAccess: jest.fn(),
  insertFileAssetAccess: jest.fn(),
  saveFileAssetAccess: jest.fn(),
  retrieveTokenUsingFileAssetId: jest.fn(),
  deleteTokenUsingFileAssetId: jest.fn(),
  deleteTokensUsingFileAssetIds: jest.fn(),
  verifyTokenBelongsToFileAssetId: jest.fn(),
};

export const mockFileAssetAccessModel = createMockFileAssetAccess({
  token:
    '1682400587136:6a69359b0b92e6ece06691311296aac86073522c868642fe6afb379cfed09b61df785774880fa5d1ed4691c3d8ea8000f6f4e60e796c3ed6599c7473ec541232',
  fileAsset: mockFileAsset,
});

export const mockTokenData = {
  fileAssetUuid: 'fileasset-1111111111111-aaaaaaaaaaaaaaaa',
  userUuid: 'citizenuser-1111111111111-aaaaaaaaaaaaaaaa',
  token: mockFileAssetAccessModel.token,
};

export const mockTokenDataBase64 = Buffer.from(JSON.stringify(mockTokenData)).toString('base64');
