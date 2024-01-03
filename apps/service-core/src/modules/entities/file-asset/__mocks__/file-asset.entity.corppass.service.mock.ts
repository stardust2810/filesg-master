import { MockService } from '../../../../typings/common.mock';
import { CorppassFileAssetEntityService } from '../file-asset.entity.corpass.service';

export const mockCorppassFileAssetEntityService: MockService<CorppassFileAssetEntityService> = {
  // Create

  // Read
  retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId: jest.fn(),
  retrieveCorporateFileAssetByUuidAndUserId: jest.fn(),
  retrieveAccessibleCorporateFileAssetByUuidAndUserId: jest.fn(),
  retrieveCorporateRecentFileAssets: jest.fn(),

  // Update
};
