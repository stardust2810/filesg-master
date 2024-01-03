import { FileAssetHistoryRequestDto } from '../../../../dtos/file/request';

export class FileAssetHistoryByFileAssetUuidAndOwnerIdDto extends FileAssetHistoryRequestDto {
  fileAssetUuid: string;
  ownerId: number;
  agencyCodes?: string[];
  activityUuid?: string;
}
