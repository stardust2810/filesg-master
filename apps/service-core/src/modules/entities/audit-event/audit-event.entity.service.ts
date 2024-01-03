import { DateRange, FileStatisticAuditEvent, PaginationOptions, UserFileAuditEvent } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { AuditEventCreationModel } from '../../../entities/audit-event';
import { AuditEventData, AuditEventQueryOptions } from '../../../typings/common';
import { AuditEventEntityRepository } from './audit-event.entity.repository';

@Injectable()
export class AuditEventEntityService {
  private logger = new Logger(AuditEventEntityService.name);

  constructor(private readonly auditEventEntityRepository: AuditEventEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildAuditEventModel(auditEventModel: AuditEventCreationModel) {
    return this.auditEventEntityRepository.getRepository().create(auditEventModel);
  }

  public async saveAuditEvent(auditEventModel: AuditEventCreationModel, entityManager?: EntityManager) {
    const auditEvent = this.buildAuditEventModel(auditEventModel);
    return await this.auditEventEntityRepository.getRepository(entityManager).save(auditEvent);
  }

  public async insertAuditEvents(auditEventModels: AuditEventCreationModel[], entityManager?: EntityManager) {
    const auditEvents = auditEventModels.map((model) => this.buildAuditEventModel(model));
    return await this.auditEventEntityRepository.getRepository(entityManager).insert(auditEvents);
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  // FIXME: try 1k/5k query limit
  //Try check this also “ SHOW VARIABLES LIKE 'max_allowed_packet’;”
  public async retrieveAuditEvents(queryOptions: AuditEventQueryOptions & PaginationOptions & DateRange, entityManager?: EntityManager) {
    if (!queryOptions.page) {
      queryOptions.page = 1;
    }
    if (!queryOptions.limit) {
      queryOptions.limit = 20;
    }

    const [auditEvents, count] = await this.auditEventEntityRepository.findAuditEvents(queryOptions, entityManager);
    const next = count - queryOptions.page! * queryOptions.limit! > 0 ? queryOptions.page! + 1 : null;
    return { auditEvents, count, next };
  }

  public async retrieveAgencyAndApplicationTypeEventCountsByEventNames(
    eventNames: UserFileAuditEvent[] | FileStatisticAuditEvent[],
    queryOptions: DateRange,
    entityManager?: EntityManager,
  ) {
    return await this.auditEventEntityRepository.findAgencyAndApplicationTypeEventCountsByEventNames(
      eventNames,
      queryOptions,
      entityManager,
    );
  }

  public async retrieveUserActionsAuditEvents(query: PaginationOptions & DateRange, entityManager?: EntityManager) {
    const { page, limit } = query;

    if (!page) {
      query.page = 1;
    }
    if (!limit) {
      query.limit = 20;
    }

    const [records, count] = await this.auditEventEntityRepository.findUserActionsAuditEvents(query, entityManager);

    const next = count - query.page! * query.limit! > 0 ? query.page! + 1 : null;

    return { records, count, next };
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateAuditEventBySubEventName(subEventName: string, data: Partial<AuditEventData>, entityManager?: EntityManager) {
    return await this.auditEventEntityRepository.updateAuditEventDataBySubEventName(subEventName, data, entityManager);
  }
}
