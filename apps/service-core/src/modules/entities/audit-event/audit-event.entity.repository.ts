import {
  AUDIT_EVENT_NAME,
  AUTH_TYPE,
  DateRange,
  PaginationOptions,
  USER_FILE_AUDIT_EVENTS,
  UserActionAuditEvent,
  UserFileAuditEvent,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, FindOptionsWhere, In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';

import { AuditEvent } from '../../../entities/audit-event';
import { AuditEventData, AuditEventQueryOptions } from '../../../typings/common';

export type UserActionRawResult = {
  agency: string | null;
  eservice: string | null;
  applicationType: string | null;
  sessionId: string | null;
  authType: AUTH_TYPE | null;
  fileAssetUuid: string | null;
  hasPerformedDocumentAction: boolean | null;
} & Record<typeof eventNameColumnMap[UserFileAuditEvent | AUDIT_EVENT_NAME.USER_LOGIN], string>;

const eventNameColumnMap: Record<UserActionAuditEvent, string> = {
  [AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD]: 'downloadCount',
  [AUDIT_EVENT_NAME.USER_FILE_PRINT_SAVE]: 'printSaveCount',
  [AUDIT_EVENT_NAME.USER_FILE_VIEW]: 'viewCount',
  [AUDIT_EVENT_NAME.USER_LOGIN]: 'loginCount',
};

@Injectable()
export class AuditEventEntityRepository {
  private readonly logger = new Logger(AuditEventEntityRepository.name);

  public constructor(
    @InjectRepository(AuditEvent)
    private auditEventEntityRepository: Repository<AuditEvent>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(AuditEvent) : this.auditEventEntityRepository;
  }

  // ===========================================================================
  // Find
  // ===========================================================================
  // json indexing
  // FIXME: stored procedure, trigger, view table
  // ETL (maybe not worth)
  public async findAuditEvents(queryOptions: AuditEventQueryOptions & PaginationOptions & DateRange, entityManager?: EntityManager) {
    const { eventName, subEventName, startDate, endDate, page, limit } = queryOptions;

    const skip = limit! * page! - limit!;

    let whereCondition: FindOptionsWhere<AuditEvent> = { eventName, subEventName };
    if (startDate && endDate) {
      whereCondition = { ...whereCondition, createdAt: Between(startDate, endDate) };
    } else if (startDate && !endDate) {
      whereCondition = { ...whereCondition, createdAt: MoreThan(startDate) };
    } else if (!startDate && endDate) {
      whereCondition = { ...whereCondition, createdAt: LessThan(endDate) };
    }

    return await this.getRepository(entityManager).findAndCount({
      where: whereCondition,
      take: limit,
      skip,
    });
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateAuditEventDataBySubEventName(subEventName: string, data: Partial<AuditEventData>, entityManager?: EntityManager) {
    const jsonSetStatements = Object.entries(data).map(([field, value]) => {
      return `data, '$."${field}"', ${value}`;
    });

    return await this.getRepository(entityManager)
      .createQueryBuilder()
      .update(AuditEvent)
      .set({
        data: () => {
          return `JSON_SET(${jsonSetStatements.join(', ')})`;
        },
      })
      .where({ subEventName })
      .execute();
  }

  // ===========================================================================
  // Document Issuance Statistics
  // ===========================================================================
  public async findAgencyAndApplicationTypeEventCountsByEventNames(
    eventNames: UserFileAuditEvent[],
    queryOptions: DateRange,
    entityManager?: EntityManager,
  ) {
    const { startDate, endDate } = queryOptions;

    const query = this.getRepository(entityManager)
      .createQueryBuilder('auditEvent')
      .select(`${this.jsonExtractSubQuery('agency')},  ${this.jsonExtractSubQuery('applicationType')}, ${this.sumSubQueries(eventNames)}`)
      .where({
        eventName: In(eventNames),
      })
      .groupBy('agency')
      .addGroupBy('applicationType');

    if (startDate) {
      query.andWhere({ createdAt: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      query.andWhere({ createdAt: LessThanOrEqual(endDate) });
    }

    return await query.getRawMany<
      {
        agency: string | undefined;
        applicationType: string | undefined;
        count: string;
      } & Record<typeof eventNameColumnMap[UserFileAuditEvent], string>
    >();
  }

  public async findUserActionsAuditEvents(
    queryOptions: PaginationOptions & DateRange,
    entityManager?: EntityManager,
  ): Promise<[UserActionRawResult[], number]> {
    const { page, limit, startDate, endDate } = queryOptions;
    const skip = limit! * page! - limit!;

    const eventNames = [...USER_FILE_AUDIT_EVENTS, AUDIT_EVENT_NAME.USER_LOGIN];

    const query = this.getRepository(entityManager)
      .createQueryBuilder('auditEvent')
      .select(
        `${this.jsonExtractSubQuery('agency')}, ${this.jsonExtractSubQuery('eservice')}, ${this.jsonExtractSubQuery(
          'applicationType',
        )}, ${this.jsonExtractSubQuery('sessionId')}, ${this.jsonExtractSubQuery('authType')}, ${this.jsonExtractSubQuery(
          'fileAssetUuid',
        )}, ${this.jsonExtractSubQuery('hasPerformedDocumentAction')}, ${this.sumSubQueries(eventNames)}`,
      )
      .where({ eventName: In(eventNames) })
      .groupBy('agency')
      .addGroupBy('eservice')
      .addGroupBy('sessionId')
      .addGroupBy('authType')
      .addGroupBy('applicationType')
      .addGroupBy('fileAssetUuid')
      .addGroupBy('hasPerformedDocumentAction')
      .where({
        eventName: In(eventNames),
      })
      .skip(skip)
      .take(limit);

    if (startDate) {
      query.andWhere({ createdAt: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      query.andWhere({ createdAt: LessThanOrEqual(endDate) });
    }

    const count = await query.getCount();
    const result = await query.getRawMany<UserActionRawResult>();

    return [result, count];
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private jsonExtractSubQuery(key: string) {
    return `JSON_UNQUOTE(JSON_EXTRACT(auditEvent.data, "$.${key}")) AS ${key}`;
  }

  private sumSubQueries(eventNames: AUDIT_EVENT_NAME[]) {
    return eventNames
      .map((eventName) => `SUM(IF(auditEvent.eventName = "${eventName}", 1, 0)) AS ${eventNameColumnMap[eventName]}`)
      .join(', ');
  }
}
