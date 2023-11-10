import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { ACTIVITY_STATUS, ACTIVITY_TYPE, COMPONENT_ERROR_CODE } from '@filesg/common';
import { CompletedActivitiesRequestDto } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';

import { Activity, ActivityCreationModel, ActivityUpdateModel } from '../../../entities/activity';
import { ActivityRecipientInfo } from '../../../typings/common';
import { generateActivityUUID } from '../../../utils/helpers';
import { ActivityEntityRepository, ActivityFileInsert } from './activity.entity.repository';

@Injectable()
export class ActivityEntityService {
  private readonly logger = new Logger(ActivityEntityService.name);
  constructor(private readonly activityRepository: ActivityEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildActivity(activityModel: ActivityCreationModel) {
    return this.activityRepository.getRepository().create({
      uuid: generateActivityUUID(),
      ...activityModel,
    });
  }

  public async insertActivities(activityModels: ActivityCreationModel[], entityManager?: EntityManager) {
    const activities = activityModels.map((model) => this.buildActivity(model));
    return await this.activityRepository.getRepository(entityManager).insert(activities);
  }

  public async saveActivities(activityModels: ActivityCreationModel[], entityManager?: EntityManager) {
    const activities = activityModels.map((model) => this.buildActivity(model));
    return await this.activityRepository.getRepository(entityManager).save(activities);
  }

  public async saveActivity(activityModel: ActivityCreationModel, entityManager?: EntityManager) {
    return (await this.saveActivities([activityModel], entityManager))[0];
  }

  public async insertActivityFiles(inserts: ActivityFileInsert[], entityManager?: EntityManager) {
    return await this.activityRepository.insertActivityFiles(inserts, entityManager);
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveActivityByUuid(uuid: string, opts?: ServiceMethodThrowOptions): Promise<Activity>;
  public async retrieveActivityByUuid(uuid: string, opts?: ServiceMethodDontThrowOptions): Promise<Activity | null>;
  public async retrieveActivityByUuid(uuid: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const activity = await this.activityRepository.getRepository(opts.entityManager).findOne({ where: { uuid } });

    if (!activity && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, 'uuid', `${uuid}`);
    }

    return activity;
  }

  public async retrieveActivityWithUserByUuid(uuid: string, opts?: ServiceMethodThrowOptions): Promise<Activity>;
  public async retrieveActivityWithUserByUuid(uuid: string, opts?: ServiceMethodDontThrowOptions): Promise<Activity | null>;
  public async retrieveActivityWithUserByUuid(uuid: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const activity = await this.activityRepository.getRepository(opts.entityManager).findOne({ where: { uuid }, relations: ['user'] });

    if (!activity && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, 'uuid', `${uuid}`);
    }

    return activity;
  }

  public async retrieveParentActivityByTransactionUuid(uuid: string, entityManager?: EntityManager) {
    const activity = await this.activityRepository.findParentActivityByTransactionUuid(uuid, entityManager);

    if (!activity) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, `transaction parent ${Activity.name}`, 'uuid', uuid);
    }

    return activity;
  }

  public async retrieveActivityWithParentByUuid(uuid: string, entityManager?: EntityManager) {
    const activity = await this.activityRepository.findActivityWithParentByUuid(uuid, entityManager);

    if (!activity) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, `${Activity.name}`, 'uuid', uuid);
    }

    return activity;
  }

  public async retrieveParentActivityByUuid(uuid: string, entityManager?: EntityManager) {
    const activity = await this.retrieveActivityWithParentByUuid(uuid, entityManager);

    if (!activity.parent) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, 'parent', `${Activity.name} with uuid`, uuid);
    }

    return activity.parent;
  }

  public async retrieveActivityByUuidAndStatusAndTypes(
    activityUuid: string,
    status: ACTIVITY_STATUS,
    types: ACTIVITY_TYPE[],
    userId?: number,
    entityManager?: EntityManager,
  ) {
    const activity = await this.activityRepository.findActivityByUuidAndStatusAndTypes(activityUuid, status, types, userId, entityManager);

    if (!activity) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.ACTIVITY_SERVICE,
        Activity.name,
        'uuid, status, and types',
        `${activityUuid}, ${status} and ${types}`,
      );
    }

    return activity;
  }

  public async retrieveActivityWithFileAssetsByUuid(uuid: string, entityManager?: EntityManager) {
    const activity = await this.activityRepository.findActivityWithFileAssetsByUuid(uuid, entityManager);

    if (!activity) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, `${Activity.name} with file assets`, 'uuid', uuid);
    }

    if (!activity.fileAssets || activity.fileAssets.length === 0) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, 'uuid', uuid);
    }

    return activity;
  }

  public async retrieveCompletedActivitiesByUserId(userId: number, query: CompletedActivitiesRequestDto, entityManager?: EntityManager) {
    const { page, limit } = query;

    // if page and limit are not given during request, means to query all
    const queryAll = !page || !limit;
    if (queryAll) {
      query.page = 0;
      query.limit = 0;
    }

    const [activities, count] = await this.activityRepository.findAndCountCompletedActivitiesByUserId(userId, query, entityManager);

    let next: number | null;

    if (queryAll) {
      next = null;
    } else {
      next = count - page * limit > 0 ? page + 1 : null;
    }

    return { activities, count, next };
  }

  public async retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType(
    parentId: string,
    type: ACTIVITY_TYPE,
    entityManager?: EntityManager,
  ) {
    return await this.activityRepository.findActivitiesWithUserAndFileAssetsParentByParentIdAndType(parentId, type, entityManager);
  }

  public async retrieveActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndTransactionUuid(
    activityType: ACTIVITY_TYPE,
    fileAssetUuids: string[],
    transactionUuid: string,
    entityManager?: EntityManager,
  ) {
    const activities =
      await this.activityRepository.findActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndFileAssetUuidsAndTransactionUuid(
        activityType,
        fileAssetUuids,
        transactionUuid,
        entityManager,
      );

    if (activities.length === 0) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.ACTIVITY_SERVICE,
        Activity.name,
        `activityType: ${activityType} and transactionUuid: ${transactionUuid}`,
      );
    }

    return activities;
  }

  public async retrieveActivitiesDetailsRequiredForEmail(uuids: string[], activityType?: ACTIVITY_TYPE, opts?: ServiceMethodThrowOptions, entityManager?: EntityManager ): Promise<Activity[]>; // prettier-ignore
  public async retrieveActivitiesDetailsRequiredForEmail(ids: number[], activityType?: ACTIVITY_TYPE, opts?: ServiceMethodThrowOptions, entityManager?: EntityManager): Promise<Activity[]>; // prettier-ignore
  public async retrieveActivitiesDetailsRequiredForEmail(
    uuids: string[] | number[],
    activityType?: ACTIVITY_TYPE,
    opts: ServiceMethodOptions = { toThrow: false },
    entityManager?: EntityManager,
  ) {
    const activities = await this.activityRepository.findActivityDetailsRequiredForEmail(uuids, activityType, entityManager);
    if (!activities.length && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, 'uuid', `${[uuids]}`);
    }
    return activities;
  }

  public async retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes(
    activityUuid: string,
    status: ACTIVITY_STATUS,
    types: ACTIVITY_TYPE[],
    userId: number,
    entityManager?: EntityManager,
  ) {
    const activityAcknowledgementDetails = await this.activityRepository.findActivityAcknowledgeDetailsByUuidAndStatusAndTypes(
      activityUuid,
      status,
      types,
      userId,
      entityManager,
    );

    if (!activityAcknowledgementDetails) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.ACTIVITY_SERVICE,
        Activity.name,
        'uuid, status, and types',
        `${activityUuid}, ${status} and ${types}`,
      );
    }
    return activityAcknowledgementDetails;
  }

  public async retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers(
    identifiers: string[] | number[],
    entityManager?: EntityManager,
  ): Promise<Activity[]> {
    const activities = await this.activityRepository.findActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers(
      identifiers,
      entityManager,
    );

    const identifierName = typeof identifiers[0] === 'string' ? 'uuids' : 'ids';

    if (!activities || activities.length === 0) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Activity.name, identifierName, identifiers.join(', '));
    }

    return activities;
  }
  // ===========================================================================
  // Update
  // ===========================================================================

  public async updateActivity(uuid: string, dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager) {
    return await this.activityRepository.updateActivity(uuid, dataToBeUpdated, entityManager);
  }

  public async updateActivityStatus(uuid: string, status: ACTIVITY_STATUS, entityManager?: EntityManager) {
    return await this.activityRepository.updateActivity(uuid, { status }, entityManager);
  }

  public async updateActivityRecipientInfo(uuid: string, recipientInfo: ActivityRecipientInfo, entityManager?: EntityManager) {
    return await this.activityRepository.updateActivity(uuid, { recipientInfo }, entityManager);
  }

  public async updateActivities(ids: number[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> //prettier-ignore
  public async updateActivities(uuids: string[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> //prettier-ignore
  public async updateActivities(identifiers: string[] | number[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> //prettier-ignore
  public async updateActivities(identifiers: string[] | number[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager) {
    return this.activityRepository.updateActivities(identifiers, dataToBeUpdated, entityManager);
  }

  public async saveActivityAcknowledgedAt(id: number, acknowledgedAt: Date, entityManager?: EntityManager) {
    return await this.activityRepository.saveActivity(id, { acknowledgedAt }, entityManager);
  }
}
