import { ArrayNotEmpty, ArrayUnique, IsArray, IsBoolean, IsEnum, IsIn, IsString } from 'class-validator';

import { AUDIT_EVENT_NAME, FILE_TYPE } from '../../constants/common';
import { ArrayOneOrMore } from '../common';

export interface FileRequirement {
  fileSize: number;
  fileType: ArrayOneOrMore<FILE_TYPE>;
  fileNumber: number; //MB
  isEqual: boolean;
  totalFileSize: number; //MB
}

export class UserFilesSingpassAuditEventRequest {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  fileAssetUuids: string[];
}

export class UserFilesCorppassAuditEventRequest extends UserFilesSingpassAuditEventRequest {}

export class UserFilesNonSingpassAuditEventRequest extends UserFilesSingpassAuditEventRequest {
  @IsBoolean()
  hasPerformedDocumentAction: boolean;
}

export class UserFilesAuditEventParams {
  @IsEnum(AUDIT_EVENT_NAME)
  @IsIn([AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD, AUDIT_EVENT_NAME.USER_FILE_PRINT_SAVE, AUDIT_EVENT_NAME.USER_FILE_VIEW])
  eventName: AUDIT_EVENT_NAME;
}
