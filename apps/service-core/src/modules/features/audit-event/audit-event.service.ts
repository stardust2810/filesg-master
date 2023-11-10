import { AUDIT_EVENT_NAME, COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseException } from '../../../common/filters/custom-exceptions.filter';
import { AuditEvent, AuditEventCreationModel } from '../../../entities/audit-event';
import {
  FileSGSession,
  UserNonSsoSessionAuditEventData,
  UserSessionAuditEventData,
  UserSsoSessionAuditEventData,
} from '../../../typings/common';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { DatabaseTransactionService } from '../../setups/database/db-transaction.service';

@Injectable()
export class AuditEventService {
  private readonly logger = new Logger(AuditEventService.name);

  constructor(
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly auditEventEntityService: AuditEventEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
  ) {}

  public async saveUserFilesAuditEvent(
    eventName: AUDIT_EVENT_NAME,
    fileAssetUuids: string[],
    userSessionAuditEventData: UserSessionAuditEventData,
    session?: FileSGSession,
  ) {
    const { userId, hasPerformedDocumentAction, sessionId, authType, ssoEservice } = userSessionAuditEventData;
    const fileAssets = await this.fileAssetEntityService.retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
      fileAssetUuids,
      userId,
    );

    if (!fileAssets || fileAssets.length === 0) {
      this.logger.warn(`[userFilesAuditEvent] Not logging as file not found.`);
      return;
    }

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      if (!hasPerformedDocumentAction) {
        await this.auditEventEntityService.updateAuditEventBySubEventName(sessionId, { hasPerformedDocumentAction: true }, entityManager);

        session && (session.user.hasPerformedDocumentAction = true);
      }

      // Type casted as hasPerformedDocumentAction isn't include in UserFileAuditEventData, but typescript is unable to match the disconstructed authType/ssoEservice typing
      const baseUserSessionAuditEventData = {
        sessionId,
        userId,
        authType,
        ssoEservice,
      } as UserSsoSessionAuditEventData | UserNonSsoSessionAuditEventData;

      const userFilesAuditEventCreationModels: AuditEventCreationModel[] = fileAssets.map((fileAsset) => {
        const eservice = fileAsset.issuer!.eservices![0]!;

        return {
          eventName,
          subEventName: fileAsset.issuer?.eservices![0].agency?.code,
          data: {
            ...baseUserSessionAuditEventData,
            fileAssetUuid: fileAsset.uuid,
            fileName: fileAsset.name,
            applicationType: fileAsset.activities![0].transaction!.application!.applicationType!.name,
            agency: eservice.agency!.name,
            eservice: eservice.name,
          },
        };
      });

      await this.auditEventEntityService.insertAuditEvents(userFilesAuditEventCreationModels, entityManager);
      await txn.commit();
    } catch (error) {
      await txn.rollback();
      const errorMessage = (error as Error).message;

      throw new DatabaseException(COMPONENT_ERROR_CODE.AUDIT_EVENT, 'updating & saving', AuditEvent.name, errorMessage);
    }
  }
}
