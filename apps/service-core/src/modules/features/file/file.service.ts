import {
  EntityNotFoundException,
  InputValidationException,
  JWT_TYPE,
  LogMethod,
  UnauthorizedRequestException,
} from '@filesg/backend-common';
import {
  ACTIVITY_TYPE,
  compareArrays,
  COMPONENT_ERROR_CODE,
  FILE_SESSION_TYPE,
  FILE_TYPE,
  FileDownloadInfo,
  FileDownloadSession,
  FileQrCodeResponse,
  GenerateFilesDownloadTokenForAgencyResponse,
  PaginationOptions,
  VIEWABLE_FILE_STATUSES,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { EntityManager } from 'typeorm';

import { InvalidFileTypeForQrGenerationException } from '../../../common/filters/custom-exceptions.filter';
import {
  transformAllFileAssets,
  transformAllFileAssetsFromAgency,
  transformAllFileAssetUuids,
  transformRecentFileAssets,
  transformViewableFileAsset,
} from '../../../common/transformers/file.transformer';
import { transformFileAssetHistoryDisplay } from '../../../common/transformers/file-asset-history.transformer';
import {
  AllFileAssetsFromAgencyRequestDto,
  AllFileAssetsFromCitizenRequestDto,
  AllFileAssetUuidsRequestDto,
  FileAccessQrData,
  FileAssetHistoryRequestDto,
} from '../../../dtos/file/request';
import { FileAsset } from '../../../entities/file-asset';
import { generateRandomString } from '../../../utils/encryption';
import { generateFileSessionUUID } from '../../../utils/helpers';
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
    private readonly fileAssetAccessService: FileAssetAccessEntityService,
    private readonly fileAssetEntityHistoryService: FileAssetHistoryEntityService,
  ) {}

  @LogMethod()
  public async retrieveAllFileAssets(userId: number, query: AllFileAssetsFromCitizenRequestDto) {
    const { fileAssets, count, next } = await this.fileAssetEntityService.retrieveAllFileAssets({ ownerId: userId, query });
    return transformAllFileAssets(fileAssets, count, next);
  }

  @LogMethod()
  public async retrieveRecentFileAssets(userId: number, query: PaginationOptions) {
    const { fileAssets, count, next } = await this.fileAssetEntityService.retrieveRecentFileAssets({ ownerId: userId, ...query });
    return transformRecentFileAssets(fileAssets, count, next);
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

    const { fileAssets, count, next } = await this.fileAssetEntityService.retrieveAllFileAssets(
      { ownerId, query, agencyId },
      entityManager,
    );
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
    const { uuid: verifiedFileAssetUuid } = await this.fileAssetEntityService.retrieveAccessibleFileAssetByUuidAndUserId(
      fileAssetUuid,
      userId,
    );

    const { fileHistoryList, totalCount, nextPage } =
      await this.fileAssetHistoryEntityService.retrieveFileAssetHistoryByFileAssetUuidAndOwnerId(verifiedFileAssetUuid, userId, query);

    return transformFileAssetHistoryDisplay(fileHistoryList, totalCount, nextPage);
  }

  @LogMethod()
  public async retrieveNonSingpassFileHistory(
    fileAssetUuid: string,
    userId: number,
    query: FileAssetHistoryRequestDto,
    activityUuid: string,
  ) {
    const { uuid: verifiedFileAssetUuid } = await this.fileAssetEntityService.retrieveAccessibleFileAssetByUuidAndUserId(
      fileAssetUuid,
      userId,
    );

    const { fileHistoryList, totalCount, nextPage } =
      await this.fileAssetHistoryEntityService.retrieveFileAssetHistoryByFileAssetUuidAndOwnerId(
        verifiedFileAssetUuid,
        userId,
        query,
        activityUuid,
      );

    return transformFileAssetHistoryDisplay(fileHistoryList, totalCount, nextPage);
  }

  public async verifyAccessTokenAndFileSessionAndJwtForDownload(fileAccessToken: string) {
    try {
      const decodedFileAccessTokenJson = JSON.parse(Buffer.from(fileAccessToken, 'base64').toString());

      const fileAccessTokenObj = plainToClass(FileAccessQrData, decodedFileAccessTokenJson);
      await validateOrReject(fileAccessTokenObj, { whitelist: true, forbidNonWhitelisted: true });

      const { fileAssetUuid, userUuid, token } = fileAccessTokenObj;
      const fileAsset = await this.fileAssetEntityService.retrieveFileAssetByUuidAndUserUuid(fileAssetUuid, userUuid);

      await this.fileAssetAccessService.verifyTokenBelongsToFileAssetId(token, fileAsset.id);

      return await this.generateFileSessionAndJwtForDownload([fileAssetUuid], userUuid);
    } catch (error) {
      const internalLog = JSON.stringify({ error, fileAccessToken });
      throw new UnauthorizedRequestException(COMPONENT_ERROR_CODE.FILE_ASSET_ACCESS_SERVICE, internalLog);
    }
  }

  @LogMethod()
  public async updateLastViewedAt(fileAssetUuid: string, userId: number, activityUuid?: string) {
    const { id } = await this.fileAssetEntityService.retrieveFileAssetByUuidAndUserId(fileAssetUuid, userId, activityUuid);
    return this.fileAssetEntityHistoryService.upsertLastViewedAt(userId, id);
  }

  @LogMethod()
  public async generateFileSessionAndJwtForDownload(
    fileAssetUuids: string[],
    ownerUuid: string,
    activityUuid?: string,
    agencyCodes?: string[],
  ) {
    const fileAssets = await this.fileAssetEntityService.retrieveDownloadableFileAssetsByUuidsAndUserUuid(
      fileAssetUuids,
      ownerUuid,
      activityUuid,
      agencyCodes,
    );

    this.validateIfFileAssetsActivityAcknowledged(fileAssets);

    const infoOfFilesToBeDownloaded: FileDownloadInfo[] = fileAssets.map((fileAsset) => {
      return { id: fileAsset.uuid, name: fileAsset.name };
    });

    this.validateMissingFileAssets(infoOfFilesToBeDownloaded, fileAssetUuids);

    const fileDownloadSession = this.generateFileDownloadSession(ownerUuid, infoOfFilesToBeDownloaded);
    return { token: await this.generateFileAssetDownloadJWT(fileDownloadSession) };
  }

  public async generateFileDownloadTokenForAgency(
    eserviceUserUuid: string,
    fileAssetUuids: string[],
    userUin?: string,
  ): Promise<GenerateFilesDownloadTokenForAgencyResponse> {
    let infoOfFilesToBeDownloaded: FileDownloadInfo[];
    let ownerUuid: string;

    if (userUin) {
      /*
        Retrieving the user object using `retrieveUserByUin` instead of filtering by UIN in the query builder
        because query builder cannot be used to query transformed fields.
      */
      const user = await this.userEntityService.retrieveUserByUin(userUin);
      const fileAssets = await this.fileAssetEntityService.retrieveFileAssetByFileAssetUuidAndUserId(
        fileAssetUuids,
        user.id,
        eserviceUserUuid,
      );

      this.validateIfFileAssetsActivityAcknowledged(fileAssets);

      infoOfFilesToBeDownloaded = fileAssets.map(({ uuid, name }) => ({ id: uuid, name }));
      ownerUuid = user.uuid;
    } else {
      const fileAssets = await this.fileAssetEntityService.retrieveAgencyFileAssetByRecipientFileAssetUuidAndEserviceUserUuid(
        fileAssetUuids,
        eserviceUserUuid,
      );

      infoOfFilesToBeDownloaded = fileAssets.map<FileDownloadInfo>(({ uuid, name, parent }) => {
        if (parent) {
          return { id: parent.uuid, name: parent.name };
        } else {
          return { id: uuid, name };
        }
      });

      ownerUuid = eserviceUserUuid;
    }

    this.validateMissingFileAssets(infoOfFilesToBeDownloaded, fileAssetUuids);

    const seenFileAssetUuids = new Set();
    infoOfFilesToBeDownloaded = infoOfFilesToBeDownloaded.filter(({ id: uuid }) => {
      if (seenFileAssetUuids.has(uuid)) {
        return false;
      }
      seenFileAssetUuids.add(uuid);
      return true;
    });

    const fileDownloadSession = this.generateFileDownloadSession(ownerUuid, infoOfFilesToBeDownloaded, true);
    return { token: await this.generateFileAssetDownloadJWT(fileDownloadSession) };
  }

  @LogMethod()
  public async generateVerifyToken(fileAssetUuid: string, userUuid: string, agencyCodes?: string[]): Promise<FileQrCodeResponse> {
    // Check if file belongs to user, method will throw error if no file found
    const fileAsset = await this.fileAssetEntityService.retrieveFileAssetByUuidAndUserUuid(
      fileAssetUuid,
      userUuid,
      agencyCodes,
      VIEWABLE_FILE_STATUSES,
    );

    if (fileAsset.documentType !== FILE_TYPE.OA) {
      throw new InvalidFileTypeForQrGenerationException(COMPONENT_ERROR_CODE.FILE_SERVICE);
    }

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

  protected async generateFileAssetDownloadJWT(fileDownloadSession: FileDownloadSession) {
    const fileSessionId = generateFileSessionUUID();
    await this.redisService.set(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionId, JSON.stringify(fileDownloadSession));

    const expiresIn = this.fileSGConfigService.authConfig.jwtDownloadTokenExpirationDuration;
    return await this.authService.generateJWT({ fileSessionId }, JWT_TYPE.FILE_DOWNLOAD, { expiresIn });
  }

  protected validateIfFileAssetsActivityAcknowledged(fileAssets: FileAsset[]) {
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
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.FILE_SERVICE,
        `Failed to create token due to unacknowledged activities in associated files. Unacknowledged FileAssets: [${unacknowledgedFileAssetUuids.join(
          ', ',
        )}]`,
      );
    }
  }

  @LogMethod()
  protected validateMissingFileAssets(infoOfFilesToBeDownloaded: FileDownloadInfo[], fileAssetUuids: string[]) {
    if (infoOfFilesToBeDownloaded.length !== fileAssetUuids.length) {
      const { additionalElements } = compareArrays<string>(
        infoOfFilesToBeDownloaded.map(({ id }) => id),
        fileAssetUuids,
      );

      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, 'file asset', 'uuid', additionalElements.join(', '));
    }
  }

  protected generateFileDownloadSession(
    ownerUuid: string,
    fileDownloadInfos: FileDownloadInfo[],
    isAgencyDownload?: boolean,
  ): FileDownloadSession {
    return {
      type: FILE_SESSION_TYPE.DOWNLOAD,
      ownerUuid,
      files: fileDownloadInfos,
      isAgencyDownload: !!isAgencyDownload,
    };
  }
}
