import { MockService } from '../../../../typings/common.mock';
import { CorppassFileAssetHistoryEntityService } from '../file-asset-history.entity.corppass.service';
import { mockFileAssetHistoryEntityService } from './file-asset-history.entity.service.mock';

export const mockCorppassFileAssetHistoryEntityService: MockService<CorppassFileAssetHistoryEntityService> = {
  //Create

  // Read
  retrieveCorporateFileAssetHistoryByFileAssetUuidAndOwnerId: jest.fn(),

  // Extended class
  ...mockFileAssetHistoryEntityService,
};
