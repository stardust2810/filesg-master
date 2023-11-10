import { EntityNotFoundException, JWT_TYPE, LogMethod, UnauthorizedRequestException } from '@filesg/backend-common';
import {
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  DownloadFile,
  FILE_SESSION_TYPE,
  FileDownloadSession,
  FileQrCodeResponse,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import {
  transformAllFileAssets,
  transformAllFileAssetsFromAgency,
  transformAllFileAssetUuids,
  transformViewableFileAsset,
} from '../../../common/transformers/file.transformer';
import { transformFileAssetHistoryDisplay } from '../../../common/transformers/file-asset-history.transformer';
import {
  AllFileAssetsFromAgencyRequestDto,
  AllFileAssetsRequestDto,
  AllFileAssetUuidsRequestDto,
  FileAssetHistoryRequestDto,
} from '../../../dtos/file/request';
import { FileAccess } from '../../../typings/common';
import { generateRandomString } from '../../../utils/encryption';
import { generateFileSessionUUID } from '../../../utils/helpers';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { EserviceEntityService } from '../../entities/eservice/eservice.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { FileAssetAccessEntityService } from '../../entities/file-asset-access/file-asset-access.entity.service';
import { FileAssetHistoryEntityService } from '../../entities/file-asset-history/file-asset-history.entity.service';
import { UserEntityService } from '../../entities/user/user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userEntityService: UserEntityService,
    private readonly redisService: RedisService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly eserviceEntityService: EserviceEntityService,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly fileAssetHistoryEntityService: FileAssetHistoryEntityService,
    private readonly auditEventEntityService: AuditEventEntityService,
    private readonly fileAssetAccessService: FileAssetAccessEntityService,
    private readonly fileAssetEntityHistoryService: FileAssetHistoryEntityService,
  ) {}

  @LogMethod()
  public async retrieveAllFileAssets(userId: number, query: AllFileAssetsRequestDto) {
    const { fileAssets, count, next } = await this.fileAssetEntityService.retrieveAllFileAssets(userId, query);
    return transformAllFileAssets(fileAssets, count, next);
  }

  @LogMethod()
  public async retrieveAllFileAssetsFromAgency(userId: number, query: AllFileAssetsFromAgencyRequestDto, entityManager?: EntityManager) {
    // get user from query, if theres user in query, get ownerId from queried user, also make issuerId = userId
    const owner = await this.userEntityService.retrieveUserByUin(query.user, { toThrow: false });

    if (!owner) {
      // return empty file array
      return {
        items: [],
        count: 0,
        next: null,
      };
    }
    const { id: ownerId } = owner;

    // get agencyId by issuerId
    const eService = await this.eserviceEntityService.retrieveEserviceByUserId(userId);
    const { agencyId } = eService;

    const { fileAssets, count, next } = await this.fileAssetEntityService.retrieveAllFileAssets(ownerId, query, agencyId, entityManager);
    return transformAllFileAssetsFromAgency(fileAssets, count, next);
  }

  @LogMethod()
  public async retrieveAllFileAssetUuids(userUuid: string, query: AllFileAssetUuidsRequestDto) {
    return transformAllFileAssetUuids(await this.fileAssetEntityService.retrieveFileAssetsByStatusAndUserUuid(userUuid, query));
  }

  @LogMethod()
  public async retrieveFileAsset(fileAssetUuid: string, userId: number) {
    return transformViewableFileAsset(await this.fileAssetEntityService.retrieveActivatedFileAssetByUuidAndUserId(fileAssetUuid, userId));
  }

  @LogMethod()
  public async retrieveNonSingpassFileAsset(fileAssetUuid: string, userId: number, activityUuid: string) {
    return transformViewableFileAsset(
      await this.fileAssetEntityService.retrieveActivatedFileAssetByUuidAndUserId(fileAssetUuid, userId, activityUuid),
    );
  }

  @LogMethod()
  public async retrieveFileHistory(fileAssetUuid: string, userId: number, query: FileAssetHistoryRequestDto) {
    const { fileHistoryList, totalCount, nextPage } =
      await this.fileAssetHistoryEntityService.retrieveFileAssetHistoryByFileAssetUuidAndOwnerId(fileAssetUuid, userId, query);

    return transformFileAssetHistoryDisplay(fileHistoryList, totalCount, nextPage);
  }

  @LogMethod()
  public async retrieveNonSingpassFileHistory(
    fileAssetUuid: string,
    userId: number,
    query: FileAssetHistoryRequestDto,
    activityUuid: string,
  ) {
    const { fileHistoryList, totalCount, nextPage } =
      await this.fileAssetHistoryEntityService.retrieveFileAssetHistoryByFileAssetUuidAndOwnerId(
        fileAssetUuid,
        userId,
        query,
        activityUuid,
      );

    return transformFileAssetHistoryDisplay(fileHistoryList, totalCount, nextPage);
  }

  @LogMethod()
  public async verifyAccessTokenAndFileSessionAndJwtForDownload(fileAccessToken: string) {
    try {
      const { fileAssetUuid, userUuid, token } = JSON.parse(Buffer.from(fileAccessToken, 'base64').toString()) as FileAccess;
      // Verify if the file assetid belong to the user.
      const fileAsset = await this.fileAssetEntityService.retrieveFileAssetByUuidAndUserUuid(fileAssetUuid, userUuid);

      // Verify if the token belong to the fileAsset.
      await this.fileAssetAccessService.verifyTokenBelongsToFileAssetId(token, fileAsset.id);

      // Generate token for file download
      return await this.generateFileSessionAndJwtForDownload([fileAssetUuid], userUuid);
    } catch (error) {
      throw new UnauthorizedRequestException(COMPONENT_ERROR_CODE.FILE_ASSET_ACCESS_SERVICE, JSON.stringify(error));
    }
  }

  @LogMethod()
  public async updateLastViewedAt(fileAssetUuid: string, userId: number, activityUuid?: string) {
    const { id } = await this.fileAssetEntityService.retrieveFileAssetByUuidAndUserId(fileAssetUuid, userId, activityUuid);
    return this.fileAssetEntityHistoryService.upsertLastViewedAt(userId, id);
  }

  @LogMethod()
  public async generateFileSessionAndJwtForDownload(fileAssetUuids: string[], ownerUuid: string, activityUuid?: string) {
    const fileAssets = await this.fileAssetEntityService.retrieveDownloadableFileAssetsByUuidsAndUserUuid(fileAssetUuids, ownerUuid);
    // Validation for Non Singpass
    if (activityUuid) {
      const doesAnyFileAssetNotContainMatchingActivity = fileAssets.some((fileAsset) => {
        return !fileAsset.activities!.some((activity) => activity.uuid === activityUuid);
      });

      if (doesAnyFileAssetNotContainMatchingActivity) {
        const internalLog = `File asset does not contain given activityUuid`;
        throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, 'fileAsset', 'activityUuid', activityUuid, internalLog);
      }
    }

    // Check for fileassets theat requires acknowledge but is not acknowledged
    const unacknowledgedFileAssetUuids = fileAssets.reduce<string[]>((prev, fileAsset) => {
      const { isAcknowledgementRequired, acknowledgedAt } = fileAsset.activities!.find(
        (activity) => activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER,
      )!;

      if (isAcknowledgementRequired && !acknowledgedAt) {
        prev.push(fileAsset.uuid);
      }

      return prev;
    }, []);

    if (unacknowledgedFileAssetUuids.length > 0) {
      const internalLog = `Unacknowledged file assets ${unacknowledgedFileAssetUuids.join(', ')}`;
      //FIXME: to revisit if 404 is suitable
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.FILE_SERVICE,
        'fileAsset',
        'uuid',
        unacknowledgedFileAssetUuids.join(', '),
        internalLog,
      );
    }

    const retrievedFileAssetUuids = fileAssets.map((file) => file.uuid);
    const missingFileAssetUuids = fileAssetUuids.filter((uuid) => !retrievedFileAssetUuids.includes(uuid));

    if (missingFileAssetUuids.length > 0) {
      const internalLog = `Failed to find file assets ${missingFileAssetUuids.join(', ')} for owner ${ownerUuid} ${
        activityUuid ? `and activity ` + activityUuid : ''
      }`;
      //FIXME: to revisit if 404 is suitable
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.FILE_SERVICE,
        'fileAsset',
        'uuid',
        missingFileAssetUuids.join(', '),
        internalLog,
      );
    }

    const files: DownloadFile[] = fileAssets.map((fileAsset) => {
      return { id: fileAsset.uuid, name: fileAsset.name };
    });

    this.logger.log(`Downloading files: ${JSON.stringify(files)}`);

    const fileSessionId = generateFileSessionUUID();
    const fileDownloadSessionObj: FileDownloadSession = {
      type: FILE_SESSION_TYPE.DOWNLOAD,
      ownerUuid,
      files,
    };

    this.logger.log(`Creating file session: ${fileSessionId}`);
    await this.redisService.set(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionId, JSON.stringify(fileDownloadSessionObj));

    const expiresIn = this.fileSGConfigService.authConfig.jwtDownloadTokenExpirationDuration;
    return await this.authService.generateJWT({ fileSessionId }, JWT_TYPE.FILE_DOWNLOAD, { expiresIn });
  }

  @LogMethod()
  public async generateVerifyToken(fileAssetUuid: string, userUuid: string): Promise<FileQrCodeResponse> {
    // Check if file belongs to user, method will throw error if no file found
    const fileAsset = await this.fileAssetEntityService.retrieveFileAssetByUuidAndUserUuid(fileAssetUuid, userUuid);

    let accessToken: string;
    const previouslyGeneratedToken = await this.fileAssetAccessService.retrieveTokenUsingFileAssetId(fileAsset.id);
    if (previouslyGeneratedToken) {
      accessToken = previouslyGeneratedToken.token;
    } else {
      // 128 just random length which is long enough to prevent collision and bruteforce
      accessToken = `${Date.now()}:${generateRandomString(128)}`;
      await this.fileAssetAccessService.insertFileAssetAccess({ token: accessToken, fileAsset });
    }

    const token = Buffer.from(JSON.stringify({ fileAssetUuid, userUuid, token: accessToken })).toString('base64');
    return { token };
  }
}
