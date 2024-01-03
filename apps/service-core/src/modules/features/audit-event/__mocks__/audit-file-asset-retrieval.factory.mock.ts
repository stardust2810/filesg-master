import { MockService } from '../../../../typings/common.mock';
import { AuditFileAssetStrategyFactory } from '../factory/audit-file-asset-retrieval.factory';
import { CorppassFileAssetStrategy } from '../strategy/audit-file-asset-retrieval/corppass-file-asset-strategy';
import { DefaultFileAssetStrategy } from '../strategy/audit-file-asset-retrieval/default-file-asset-strategy';

export const mockAuditFileAssetStrategyFactory: MockService<AuditFileAssetStrategyFactory> = {
  getStrategy: jest.fn(),
};

export const mockDefaultAuditFileAssetStrategy: MockService<DefaultFileAssetStrategy> = {
  retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId: jest.fn(),
  buildBaseUserSessionAuditEventData: jest.fn(),
};

export const mockCorppassAuditFileAssetStrategy: MockService<CorppassFileAssetStrategy> = {
  retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId: jest.fn(),
  buildBaseUserSessionAuditEventData: jest.fn(),
};
