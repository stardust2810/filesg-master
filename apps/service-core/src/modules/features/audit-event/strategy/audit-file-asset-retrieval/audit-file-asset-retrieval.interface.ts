import { FileAsset } from '../../../../../entities/file-asset';
import {
  FileSGCitizenSession,
  FileSGCorporateUserSession,
  UserCorporateSessionAuditEventData,
  UserNonSsoSessionAuditEventData,
  UserSsoSessionAuditEventData,
} from '../../../../../typings/common';

export interface FileAssetStrategy {
  retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
    fileAssetUuids: string[],
    userId: number,
    session?: FileSGCitizenSession | FileSGCorporateUserSession,
  ): Promise<FileAsset[]>;

  buildBaseUserSessionAuditEventData(
    auditEvent: UserSsoSessionAuditEventData | UserNonSsoSessionAuditEventData | UserCorporateSessionAuditEventData,
  ): Promise<UserSsoSessionAuditEventData | UserNonSsoSessionAuditEventData | UserCorporateSessionAuditEventData>;
}
