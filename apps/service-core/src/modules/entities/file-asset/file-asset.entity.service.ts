import {
  EntityNotFoundException,
  getNextPage,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import {
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  DateRange,
  FILE_FAIL_CATEGORY,
  FILE_STATUS,
  FILE_TYPE,
  VIEWABLE_FILE_STATUSES,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { startOfDay } from 'date-fns';
import { EntityManager, LessThan, LessThanOrEqual, UpdateResult } from 'typeorm';

import { AllFileAssetsRequestDto, AllFileAssetUuidsRequestDto } from '../../../dtos/file/request';
import { FileAsset, FileAssetCreationModel, FileAssetUpdateModel } from '../../../entities/file-asset';
import { generateEntityUUID } from '../../../utils/helpers';
import { FileAssetEntityRepository } from './file-asset.entity.repository';

interface UpdateFileStatusInput {
  status: FILE_STATUS;
  failCategory?: FILE_FAIL_CATEGORY;
  failReason?: string;
}

@Injectable()
export class FileAssetEntityService {
  private readonly logger = new Logger(FileAssetEntityService.name);

  constructor(private readonly fileAssetEntityRepository: FileAssetEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildFileAsset(fileAssetModel: FileAssetCreationModel) {
    return this.fileAssetEntityRepository.getRepository().create({
      uuid: generateEntityUUID(FileAsset.name),
      ...fileAssetModel,
    });
  }

  public async insertFileAssets(fileAssetModels: FileAssetCreationModel[], entityManager?: EntityManager) {
    const fileAssets = fileAssetModels.map((model) => this.buildFileAsset(model));
    return await this.fileAssetEntityRepository.getRepository(entityManager).insert(fileAssets);
  }

  public async saveFileAssets(fileAssetModels: FileAssetCreationModel[], entityManager?: EntityManager) {
    const fileAssets = fileAssetModels.map((model) => this.buildFileAsset(model));
    return await this.fileAssetEntityRepository.getRepository(entityManager).save(fileAssets);
  }

  public async saveFileAsset(fileAssetModel: FileAssetCreationModel, entityManager?: EntityManager) {
    return (await this.saveFileAssets([fileAssetModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveFileAssetByUuid(uuid: string, entityManager?: EntityManager) {
    const fileAsset = await this.fileAssetEntityRepository.getRepository(entityManager).findOne({
      where: {
        uuid,
      },
    });

    if (!fileAsset) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', uuid);
    }

    return fileAsset;
  }

  public async retrieveFileAssetByUuidAndUserUuid(uuid: string, userUuid: string, entityManager?: EntityManager) {
    const fileAsset = await this.fileAssetEntityRepository.findFileAssetByUuidAndUserUuid(uuid, userUuid, entityManager);

    if (!fileAsset) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid and userUuid', `${uuid} and ${userUuid}`);
    }

    return fileAsset;
  }

  public async retrieveFileAssetByUuidAndUserId(uuid: string, userId: number, activityUuid?: string, entityManager?: EntityManager) {
    const fileAsset = await this.fileAssetEntityRepository.findFileAssetByUuidAndUserId(uuid, userId, activityUuid, entityManager);

    if (!fileAsset) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', uuid);
    }

    return fileAsset;
  }

  public async retrieveActivatedFileAssetByUuidAndUserId(uuid: string, userId: number, activityUuid?: string, opts?: ServiceMethodThrowOptions): Promise<FileAsset>; //prettier-ignore
  public async retrieveActivatedFileAssetByUuidAndUserId(uuid: string, userId: number, activityUuid?: string, opts?: ServiceMethodDontThrowOptions): Promise<FileAsset | null>; //prettier-ignore
  public async retrieveActivatedFileAssetByUuidAndUserId(
    uuid: string,
    userId: number,
    activityUuid?: string,
    opts: ServiceMethodOptions = { toThrow: true },
  ) {
    const fileAsset = await this.fileAssetEntityRepository.findActivatedFileAssetByUuidAndUserId(uuid, userId, opts?.entityManager);

    if (opts?.toThrow) {
      if (!fileAsset) {
        throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', uuid);
      }

      if (activityUuid && !fileAsset.activities!.some((activity) => activity.uuid === activityUuid)) {
        throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', uuid);
      }
    }

    return fileAsset;
  }

  public async retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
    uuids: string[],
    userId: number,
    activityUuid?: string,
    entityManager?: EntityManager,
  ) {
    return await this.fileAssetEntityRepository.findActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
      uuids,
      userId,
      activityUuid,
      entityManager,
    );
  }

  public async retrieveFileAssetsByUuids(uuids: string[], entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.findFileAssetsByUuids(uuids, entityManager);
  }

  public async retrieveFileAssetsByUuidsWithAgencyInfo(uuids: string[], entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.findFileAssetsByUuidsWithAgencyInfo(uuids, entityManager);
  }

  public async retrieveDownloadableFileAssetsByUuidsAndUserUuid(
    uuids: string[],
    userUuid: string,
    activityUuid?: string,
    entityManager?: EntityManager,
  ) {
    return await this.fileAssetEntityRepository.findDownloadableFileAssetsByUuidsAndUserUuid(uuids, userUuid, activityUuid, entityManager);
  }

  public async retrieveFileAssetsWithParentAndOaCertificateByUuids(uuids: string[], entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.findFileAssetsWithParentAndOaCertificateByUuids(uuids, entityManager);
  }

  public async retrieveAllChildrenUsingParentUuids(uuids: string[], entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.findAllChildrenUsingParentUuids(uuids, entityManager);
  }

  public async retrieveFileAssetsByStatusAndUserUuid(userUuid: string, query: AllFileAssetUuidsRequestDto, entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.findViewableFileAssetsByStatusAndUserUuid(userUuid, query, entityManager);
  }

  public async retrieveAllFileAssets(userId: number, query: AllFileAssetsRequestDto, agencyId?: number, entityManager?: EntityManager) {
    if (!query.page) {
      query.page = 1;
    }
    if (!query.limit) {
      query.limit = 20;
    }
    // get files by ownerId
    const [fileAssets, count] = await this.fileAssetEntityRepository.findAndCountViewableFileAssets(userId, query, agencyId, entityManager);

    const next = getNextPage(count, query.page, query.limit);

    return { fileAssets, count, next };
  }

  public async retrieveFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid(
    status: FILE_STATUS,
    documentType: FILE_TYPE,
    activityType: ACTIVITY_TYPE,
    transactionUuid: string,
    entityManager?: EntityManager,
  ) {
    return await this.fileAssetEntityRepository.findFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid(
      status,
      documentType,
      activityType,
      transactionUuid,
      entityManager,
    );
  }

  public async retrieveFileAssetsByStatusAndExpireAt(take: number, entityManager?: EntityManager) {
    const currentDate = startOfDay(new Date());

    return this.fileAssetEntityRepository.findFileAssetsByStatusAndExpireAt(FILE_STATUS.ACTIVE, currentDate, LessThan, take, entityManager);
  }

  public async retrieveFileAssetsByStatusesAndDeleteAt(take: number, entityManager?: EntityManager) {
    const currentDate = startOfDay(new Date());

    return this.fileAssetEntityRepository.findFileAssetsByStatusesAndDeleteAt(
      VIEWABLE_FILE_STATUSES,
      currentDate,
      LessThanOrEqual,
      take,
      entityManager,
    );
  }

  public async retrieveCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses(
    queryOptions: DateRange,
    entityManager?: EntityManager,
  ) {
    return await this.fileAssetEntityRepository.findCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses(
      queryOptions,
      entityManager,
    );
  }

  public async retrieveCountAccessedAgencyIssuedFileAssets(queryOption: DateRange, entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.findCountAccessedAgencyIssuedFileAssets(queryOption, entityManager);
  }

  public async retrieveAgenciesIssuingFileAssetsWithStatusesByUserId(
    userId: number,
    statuses: FILE_STATUS[],
    entityManager?: EntityManager,
  ) {
    return await this.fileAssetEntityRepository.findAgenciesIssuingFileAssetsWithStatusesByUserId(userId, statuses, entityManager);
  }
  // ===========================================================================
  // Update
  // ===========================================================================

  public async updateFileAsset(uuid: string, dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.updateFileAsset(uuid, dataToBeUpdated, entityManager);
  }

  public async updateFileAssets(uuids: string[], dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateFileAssets(ids: number[], dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateFileAssets(identifiers: string[] | number[], dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager) {
    return await this.fileAssetEntityRepository.updateFileAssets(identifiers, dataToBeUpdated, entityManager);
  }

  public async updateFileAssetFamilyByParentId(
    parentFileAssetId: number,
    dataToBeUpdated: FileAssetUpdateModel,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.fileAssetEntityRepository.updateFileAssetFamilyByParentId(parentFileAssetId, dataToBeUpdated, entityManager);
  }

  public async updateFileAssetStatus(
    uuid: string,
    fileStatus: UpdateFileStatusInput,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.updateFileAsset(uuid, fileStatus, entityManager);
  }

  public async updateFileAssetLastViewedAt(uuid: string, entityManager?: EntityManager): Promise<UpdateResult> {
    const lastViewedAt = new Date();
    return await this.updateFileAsset(uuid, { lastViewedAt }, entityManager);
  }
}
