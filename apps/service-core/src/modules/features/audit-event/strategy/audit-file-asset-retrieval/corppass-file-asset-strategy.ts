import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';

import { FileAsset } from '../../../../../entities/file-asset';
import { FileSGCorporateUserSession, UserCorporateSessionAuditEventData } from '../../../../../typings/common';
import { CorppassFileAssetEntityService } from '../../../../entities/file-asset/file-asset.entity.corpass.service';
import { FileAssetStrategy } from './audit-file-asset-retrieval.interface';

@Injectable()
export class CorppassFileAssetStrategy implements FileAssetStrategy {
  constructor(private readonly corppassFileAssetEntityService: CorppassFileAssetEntityService) {}

  async retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
    fileAssetUuids: string[],
    userId: number,
    session?: FileSGCorporateUserSession,
  ): Promise<FileAsset[]> {
    const { accessibleAgencies, corporateBaseUserId } = session!.user;

    if (isEmpty(accessibleAgencies)) {
      return [];
    }

    const accessibleAgencyCodes = accessibleAgencies!.map(({ code }) => code);
    const canAccessAll = accessibleAgencyCodes.includes('ALL');

    return this.corppassFileAssetEntityService.retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
      fileAssetUuids,
      corporateBaseUserId,
      canAccessAll ? undefined : accessibleAgencyCodes,
    );
  }

  async buildBaseUserSessionAuditEventData({
    sessionId,
    userId,
    authType,
    corporateId,
  }: UserCorporateSessionAuditEventData): Promise<UserCorporateSessionAuditEventData> {
    return {
      sessionId,
      userId,
      authType,
      corporateId,
    };
  }
}
