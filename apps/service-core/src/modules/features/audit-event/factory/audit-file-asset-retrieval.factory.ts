import { AUTH_TYPE } from '@filesg/common';
import { Injectable } from '@nestjs/common';

import { FileAssetStrategy } from '../strategy/audit-file-asset-retrieval/audit-file-asset-retrieval.interface';
import { CorppassFileAssetStrategy } from '../strategy/audit-file-asset-retrieval/corppass-file-asset-strategy';
import { DefaultFileAssetStrategy } from '../strategy/audit-file-asset-retrieval/default-file-asset-strategy';

@Injectable()
export class AuditFileAssetStrategyFactory {
  constructor(
    private readonly defaultFileAssetStrategy: DefaultFileAssetStrategy,
    private readonly corppassFileAssetStrategy: CorppassFileAssetStrategy,
  ) {}

  private readonly serviceMapper = {
    [AUTH_TYPE.CORPPASS]: this.corppassFileAssetStrategy,
    [AUTH_TYPE.NON_SINGPASS]: this.defaultFileAssetStrategy,
    [AUTH_TYPE.SINGPASS]: this.defaultFileAssetStrategy,
    [AUTH_TYPE.SINGPASS_SSO]: this.defaultFileAssetStrategy,
  };

  async getStrategy(authType: AUTH_TYPE): Promise<FileAssetStrategy> {
    return this.serviceMapper[authType];
  }
}
