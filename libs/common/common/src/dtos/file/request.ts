import { IsArray, IsBoolean, IsString } from 'class-validator';

import { FILE_TYPE } from '../../constants/common';
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
  @IsString({ each: true })
  fileAssetUuids: string[];
}

export class UserFilesNonSingpassAuditEventRequest {
  @IsArray()
  @IsString({ each: true })
  fileAssetUuids: string[];

  @IsBoolean()
  hasPerformedDocumentAction: boolean;
}
