import { FILE_ASSET_ACTION, FileHistory, FileHistoryDisplayResponse, USER_TYPE } from '@filesg/common';

import { FileAssetHistory } from '../../entities/file-asset-history';

// =============================================================================
// Defaults
// =============================================================================
// FIXME: Not used atm
// export function transformBasicFileAssetHistory(fileAssetHistory: FileAssetHistory): BasicFileAssetHistoryResponse {
//   return {
//     uuid: fileAssetHistory.uuid,
//     createdAt: fileAssetHistory.createdAt,
//   };
// }

// export function transformDetailFileAssetHistory(fileAssetHistory: FileAssetHistory): DetailFileAssetHistoryResponse {
//   return {
//     ...transformBasicFileAssetHistory(fileAssetHistory),
//     type: fileAssetHistory.type,
//   };
// }

// =============================================================================
// Service-based
// =============================================================================
export function transformFileAssetHistoryDisplay(
  fileAssetHistory: FileAssetHistory[],
  totalRecords: number,
  nextPage: number | null,
): FileHistoryDisplayResponse {
  const fileHistory = fileAssetHistory.map((fileHistory): FileHistory => {
    const actionBy =
      fileHistory.actionBy?.type !== USER_TYPE.CITIZEN ? fileHistory.actionBy!.eservices![0].agency!.code : fileHistory.actionBy.name!;

    const fileHistoryObj: FileHistory = {
      id: fileHistory.id,
      createdAt: fileHistory.createdAt,
      type: fileHistory.type,
      actionBy,
      actionByType: fileHistory.actionBy!.type,
    };

    if (fileHistoryObj.type === FILE_ASSET_ACTION.REVOKED || fileHistoryObj.type === FILE_ASSET_ACTION.EXPIRE) {
      fileHistoryObj.revocationType = fileHistory.fileAsset!.oaCertificate!.revocationType!;
    }

    return fileHistoryObj;
  });

  return {
    fileHistory,
    totalRecords,
    nextPage,
  };
}
