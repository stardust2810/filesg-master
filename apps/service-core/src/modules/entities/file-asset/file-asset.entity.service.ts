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

import { AllFileAssetUuidsRequestDto } from '../../../dtos/file/request';
import { FileAsset, FileAssetCreationModel, FileAssetUpdateModel } from '../../../entities/file-asset';
import { generateEntityUUID } from '../../../utils/helpers';
import { FileAssetEntityRepository } from './file-asset.entity.repository';
import {
  FindAndCountCorporateViewableFileAssetsInputs,
  FindAndCountRecentFileAssetsInputs,
  FindAndCountViewableFileAssetsInputs,
} from './interface/file-asset.interface';

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

  public async retrieveFileAssetByUuidAndUserUuid(
    uuid: string,
    userUuid: string,
    agencyCodes?: string[],
    statuses?: FILE_STATUS[],
    entityManager?: EntityManager,
  ) {
    const fileAsset = await this.fileAssetEntityRepository.findFileAssetByUuidAndUserUuid(
      uuid,
      userUuid,
      agencyCodes,
      statuses,
      entityManager,
    );

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

  public async retrieveAccessibleFileAssetByUuidAndUserId(uuid: string, userId: number, activityUuid?: string, opts?: ServiceMethodThrowOptions): Promise<FileAsset>; //prettier-ignore
  public async retrieveAccessibleFileAssetByUuidAndUserId(uuid: string, userId: number, activityUuid?: string, opts?: ServiceMethodDontThrowOptions): Promise<FileAsset | null>; //prettier-ignore
  public async retrieveAccessibleFileAssetByUuidAndUserId(
    uuid: string,
    userId: number,
    activityUuid?: string,
    opts: ServiceMethodOptions = { toThrow: true },
  ) {
    const fileAsset = await this.fileAssetEntityRepository.findAccessibleFileAssetByUuidAndUserId(uuid, userId, opts?.entityManager);

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
    agencyCodes?: string[],
    entityManager?: EntityManager,
  ) {
    return await this.fileAssetEntityRepository.findDownloadableFileAssetsByUuidsAndUserUuid(
      uuids,
      userUuid,
      activityUuid,
      agencyCodes,
      entityManager,
    );
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

  public async retrieveFileAssetsByStatusAndCorporateUen(
    corporateUen: string,
    query: AllFileAssetUuidsRequestDto,
    entityManager?: EntityManager,
  ) {
    return this.fileAssetEntityRepository.findViewableFileAssetsByStatusAndCorporateUen(corporateUen, query, entityManager);
  }

  public async retrieveRecentFileAssets(query: FindAndCountRecentFileAssetsInputs, entityManager?: EntityManager) {
    const { page, limit } = query;

    // get files by ownerId
    const [fileAssets, count] = await this.fileAssetEntityRepository.findAndCountRecentViewableFileAssets(query, entityManager);
    const next = getNextPage(count, page!, limit!);
    return { fileAssets, count, next };
  }

  public async retrieveAllFileAssets(inputs: FindAndCountViewableFileAssetsInputs, entityManager?: EntityManager) {
    const { query } = inputs;

    // get files by ownerId
    const [fileAssets, count] = await this.fileAssetEntityRepository.findAndCountViewableFileAssets(inputs, entityManager);
    const next = getNextPage(count, query.page!, query.limit!);
    return { fileAssets, count, next };
  }

  // TODO: REMOVE ME
  public async retrieveAllCorporateFileAssets(inputs: FindAndCountCorporateViewableFileAssetsInputs, entityManager?: EntityManager) {
    const { query } = inputs;

    // get files by ownerId
    const [fileAssets, count] = await this.fileAssetEntityRepository.findAndCountCorporateViewableFileAssets(inputs, entityManager);
    const next = getNextPage(count, query.page!, query.limit!);
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

  public async retrieveFileAssetByFileAssetUuidAndUserId(fileAssetUuids: string[], userId: number, eserviceUserUuid: string) {
    return await this.fileAssetEntityRepository.findFileAssetUsingFileAssetUuidAndUserId(fileAssetUuids, userId, eserviceUserUuid);
  }

  public async retrieveAgencyFileAssetByRecipientFileAssetUuidAndEserviceUserUuid(fileAssetUuids: string[], eserviceUserUuid: string) {
    return await this.fileAssetEntityRepository.findAgencyFileAssetByRecipientFileAssetUuidAndEserviceUserUuid(
      fileAssetUuids,
      eserviceUserUuid,
    );
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
}
