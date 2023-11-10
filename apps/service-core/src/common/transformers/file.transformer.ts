import {
  ACTIVITY_TYPE,
  AllFileAssetsFromAgencyResponse,
  AllFileAssetsResponse,
  AllFileAssetUuidsResponse,
  BasicFileAssetResponse,
  DetailFileAssetResponse,
  FILE_ASSET_ACTION,
  isDeletedByDate,
  isExpiredByDate,
  ViewableFileAssetFromAgencyResponse,
  ViewableFileAssetResponse,
} from '@filesg/common';

import { FileAsset } from '../../entities/file-asset';

// =============================================================================
// Defaults
// =============================================================================
export function transformBasicFileAsset(fileAsset: FileAsset): BasicFileAssetResponse {
  const { uuid, name, documentType, size, status, expireAt, createdAt, deleteAt, isPasswordEncrypted } = fileAsset;
  return {
    uuid,
    name,
    type: documentType,
    size,
    status,
    expireAt,
    createdAt,
    deleteAt,
    isPasswordEncrypted,
    isExpired: !!expireAt && isExpiredByDate(expireAt),
    isDeleted: !!deleteAt && isDeletedByDate(deleteAt),
  };
}

function transformDetailFileAsset(fileAsset: FileAsset): DetailFileAssetResponse {
  const lastViewedHistory = fileAsset.histories?.find((history) => history.type === FILE_ASSET_ACTION.VIEWED);

  return {
    ...transformBasicFileAsset(fileAsset),
    metadata: fileAsset.metadata,
    lastViewedAt: lastViewedHistory?.lastViewedAt ?? null,
  };
}

// =============================================================================
// Feature module services
// =============================================================================
export function transformAllFileAssets(fileAssets: FileAsset[], count: number, next: number | null): AllFileAssetsResponse {
  return {
    items: fileAssets.map((fileAsset) => {
      return transformViewableFileAsset(fileAsset);
    }),
    count,
    next,
  };
}

export function transformAllFileAssetsFromAgency(
  fileAssets: FileAsset[],
  count: number,
  next: number | null,
): AllFileAssetsFromAgencyResponse {
  return {
    items: fileAssets.map((fileAsset) => {
      return transformViewableFileAssetFromAgency(fileAsset);
    }),
    count,
    next,
  };
}

export function transformViewableFileAsset(fileAsset: FileAsset): ViewableFileAssetResponse {
  const eservice = fileAsset.issuer!.eservices![0];
  const receiveTransferActivity = fileAsset.activities!.find((activity) => activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER)!;
  const receiveDeleteActivity = fileAsset.activities!.find((activity) => activity.type === ACTIVITY_TYPE.RECEIVE_DELETE) ?? null;
  const { owner } = fileAsset;
  const { name: ownerName } = owner!;
  const { name: eServiceName, agency } = eservice;
  const { name: agencyName, code: agencyCode } = agency!;
  const { isAcknowledgementRequired, acknowledgedAt, uuid: receiveTransferActivityUuid } = receiveTransferActivity;
  const externalRefId = receiveTransferActivity.transaction?.application?.externalRefId ?? null;

  return {
    ...transformDetailFileAsset(fileAsset),
    agencyName,
    eServiceName,
    agencyCode,
    ownerName: ownerName!,
    isAcknowledgementRequired,
    acknowledgedAt,
    receiveTransferActivityUuid,
    receiveDeleteActivityUuid: receiveDeleteActivity && receiveDeleteActivity.uuid,
    externalRefId,
  };
}

function transformViewableFileAssetFromAgency(fileAsset: FileAsset): ViewableFileAssetFromAgencyResponse {
  const eservice = fileAsset.issuer!.eservices![0];
  const { name: eServiceName, agency } = eservice;
  const { name: agencyName, code: agencyCode } = agency!;
  const receiveTransferActivity = fileAsset.activities!.find((activity) => activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER)!;
  const externalRefId = receiveTransferActivity.transaction?.application?.externalRefId ?? null;

  return {
    ...transformDetailFileAsset(fileAsset),
    eServiceName,
    agencyName,
    agencyCode,
    externalRefId,
  };
}

export function transformAllFileAssetUuids(fileAssets: FileAsset[]): AllFileAssetUuidsResponse {
  return {
    fileAssets: fileAssets.map((fileAsset) => fileAsset.uuid),
  };
}
