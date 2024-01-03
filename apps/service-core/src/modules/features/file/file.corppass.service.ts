import { EntityNotFoundException, LogMethod } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, PaginationOptions, ViewableFileAssetResponse } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { isEmpty } from 'lodash';

import {
  transformAllFileAssets,
  transformAllFileAssetUuids,
  transformRecentFileAssets,
  transformViewableFileAsset,
} from '../../../common/transformers/file.transformer';
import { transformFileAssetHistoryDisplay } from '../../../common/transformers/file-asset-history.transformer';
import { AllFileAssetsFromCorporateRequestDto, AllFileAssetUuidsRequestDto, FileAssetHistoryRequestDto } from '../../../dtos/file/request';
import { FileAsset } from '../../../entities/file-asset';
import { CorporateUserAuthUser } from '../../../typings/common';
import { assertAccessibleAgencies } from '../../../utils/corppass';
import { CorppassFileAssetEntityService } from '../../entities/file-asset/file-asset.entity.corpass.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { CorppassFileAssetHistoryEntityService } from '../../entities/file-asset-history/file-asset-history.entity.corppass.service';
import { FileService } from './file.service';

@Injectable()
export class CorppassFileService {
  private readonly logger = new Logger(CorppassFileService.name);

  constructor(
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly fileService: FileService,
    private readonly corppassFileAssetHistoryEntityService: CorppassFileAssetHistoryEntityService,
    private readonly corppassFileAssetEntityService: CorppassFileAssetEntityService,
  ) {}

  @LogMethod()
  public async generateFileSessionAndJwtForDownload(fileAssetUuids: string[], user: CorporateUserAuthUser) {
    const { corporateBaseUserUuid, accessibleAgencies } = user;

    if (accessibleAgencies?.length === 0) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', fileAssetUuids.join(', '));
    }

    const accessibleAgencyCodes = accessibleAgencies!.map(({ code }) => code);
    const canAccessAll = accessibleAgencyCodes.includes('ALL');

    return this.fileService.generateFileSessionAndJwtForDownload(
      fileAssetUuids,
      corporateBaseUserUuid!,
      undefined,
      canAccessAll ? undefined : accessibleAgencyCodes,
    );
  }

  @LogMethod()
  public async retrieveRecentFileAssets(user: CorporateUserAuthUser, query: PaginationOptions) {
    const { accessibleAgencies, corporateBaseUserId, userId } = user;

    if (isEmpty(accessibleAgencies)) {
      return transformRecentFileAssets([], 0, null, userId);
    }

    const accessibleAgencyCodes = accessibleAgencies.map(({ code }) => code);
    const canAccessAll = accessibleAgencyCodes.includes('ALL');

    const { fileAssets, count, next } = await this.corppassFileAssetEntityService.retrieveCorporateRecentFileAssets({
      ownerId: corporateBaseUserId!,
      historyActionById: userId,
      query,
      accessibleAgencyCodes: canAccessAll ? undefined : accessibleAgencyCodes,
    });

    return transformRecentFileAssets(fileAssets, count, next, userId);
  }

  @LogMethod()
  public async retrieveAllFileAssets(user: CorporateUserAuthUser, query: AllFileAssetsFromCorporateRequestDto) {
    const { accessibleAgencies, corporateBaseUserId, userId } = user;
    const { agencyCodes } = query;

    const { agencyCodesToAccess, userHasAccessToAll } = assertAccessibleAgencies(accessibleAgencies, agencyCodes!);
    const isEmptyAgencyCodesToAccess = agencyCodesToAccess.length === 0;

    if (isEmptyAgencyCodesToAccess && !userHasAccessToAll) {
      return transformAllFileAssets([], 0, null, userId);
    }

    query.agencyCodes = isEmptyAgencyCodesToAccess && userHasAccessToAll ? undefined : agencyCodesToAccess;

    const { fileAssets, count, next } = await this.fileAssetEntityService.retrieveAllCorporateFileAssets({
      ownerId: corporateBaseUserId!,
      query,
    });

    return transformAllFileAssets(fileAssets, count, next, userId);
  }

  @LogMethod()
  public async retrieveAllCorporateFileAssetUuids(user: CorporateUserAuthUser, query: AllFileAssetUuidsRequestDto) {
    const { agencyCodes } = query;
    const { accessibleAgencies, corporateUen } = user;

    const { agencyCodesToAccess, userHasAccessToAll } = assertAccessibleAgencies(accessibleAgencies, agencyCodes!);
    const isEmptyAgencyCodesToAccess = agencyCodesToAccess.length === 0;

    if (isEmptyAgencyCodesToAccess && !userHasAccessToAll) {
      return transformAllFileAssetUuids([]);
    }

    query.agencyCodes = isEmptyAgencyCodesToAccess && userHasAccessToAll ? undefined : agencyCodesToAccess;

    const results = await this.fileAssetEntityService.retrieveFileAssetsByStatusAndCorporateUen(corporateUen!, query);

    return transformAllFileAssetUuids(results);
  }

  public async retrieveCorporateFileAsset(fileAssetUuid: string, user: CorporateUserAuthUser): Promise<ViewableFileAssetResponse> {
    const { corporateBaseUserId, accessibleAgencies } = user;

    if (accessibleAgencies.length === 0) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', fileAssetUuid);
    }

    const accessibleAgencyCodes = accessibleAgencies!.map(({ code }) => code);
    const canAccessAll = accessibleAgencyCodes.includes('ALL');

    return transformViewableFileAsset(
      await this.corppassFileAssetEntityService.retrieveCorporateFileAssetByUuidAndUserId(
        fileAssetUuid,
        corporateBaseUserId!,
        undefined,
        canAccessAll ? undefined : accessibleAgencyCodes,
      ),
      user.userId,
    );
  }

  @LogMethod()
  public async updateCorppassLastViewedAt(fileAssetUuid: string, user: CorporateUserAuthUser, activityUuid?: string) {
    const { corporateBaseUserId, accessibleAgencies, userId } = user;

    if (isEmpty(accessibleAgencies)) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', fileAssetUuid);
    }

    const accessibleAgencyCodes = accessibleAgencies!.map(({ code }) => code);
    const canAccessAll = accessibleAgencyCodes.includes('ALL');

    const { id } = await this.corppassFileAssetEntityService.retrieveCorporateFileAssetByUuidAndUserId(
      fileAssetUuid,
      corporateBaseUserId!,
      activityUuid,
      canAccessAll ? undefined : accessibleAgencyCodes,
    );
    return this.corppassFileAssetHistoryEntityService.upsertLastViewedAt(userId!, id);
  }

  @LogMethod()
  public async retrieveFileHistory(fileAssetUuid: string, user: CorporateUserAuthUser, query: FileAssetHistoryRequestDto) {
    const { corporateBaseUserId, accessibleAgencies } = user;

    if (isEmpty(accessibleAgencies)) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', fileAssetUuid);
    }

    const accessibleAgencyCodes = accessibleAgencies!.map(({ code }) => code);
    const canAccessAll = accessibleAgencyCodes.includes('ALL');

    const { uuid: verifiedUuid } = await this.corppassFileAssetEntityService.retrieveAccessibleCorporateFileAssetByUuidAndUserId(
      fileAssetUuid,
      corporateBaseUserId,
      undefined,
      canAccessAll ? undefined : accessibleAgencyCodes,
    );

    const { fileHistoryList, totalCount, nextPage } =
      await this.corppassFileAssetHistoryEntityService.retrieveCorporateFileAssetHistoryByFileAssetUuidAndOwnerId({
        fileAssetUuid: verifiedUuid,
        ownerId: corporateBaseUserId,
        agencyCodes: canAccessAll ? undefined : accessibleAgencyCodes,
        ...query,
      });

    return transformFileAssetHistoryDisplay(fileHistoryList, totalCount, nextPage);
  }

  public async generateVerifyToken(fileAssetUuid: string, user: CorporateUserAuthUser) {
    const { corporateBaseUserUuid, accessibleAgencies } = user;

    if (isEmpty(accessibleAgencies)) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.FILE_SERVICE,
        FileAsset.name,
        'uuid and userUuid',
        `${fileAssetUuid} and ${corporateBaseUserUuid}`,
      );
    }

    const accessibleAgencyCodes = accessibleAgencies!.map(({ code }) => code);
    const canAccessAll = accessibleAgencyCodes.includes('ALL');

    return this.fileService.generateVerifyToken(fileAssetUuid, corporateBaseUserUuid, canAccessAll ? undefined : accessibleAgencyCodes);
  }
}
