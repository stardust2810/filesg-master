import { Injectable } from '@nestjs/common';

import { FileAsset } from '../../../../../entities/file-asset';
import { CitizenUserSessionAuditEventData } from '../../../../../typings/common';
import { FileAssetEntityService } from '../../../../entities/file-asset/file-asset.entity.service';
import { FileAssetStrategy } from './audit-file-asset-retrieval.interface';

@Injectable()
export class DefaultFileAssetStrategy implements FileAssetStrategy {
  constructor(private readonly fileAssetEntityService: FileAssetEntityService) {}

  async retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(fileAssetUuids: string[], userId: number): Promise<FileAsset[]> {
    return this.fileAssetEntityService.retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(fileAssetUuids, userId);
  }

  async buildBaseUserSessionAuditEventData({
    sessionId,
    userId,
    authType,
    ssoEservice,
  }: CitizenUserSessionAuditEventData): Promise<CitizenUserSessionAuditEventData> {
    return {
      sessionId,
      userId,
      authType,
      ssoEservice,
    } as CitizenUserSessionAuditEventData;
  }
}
