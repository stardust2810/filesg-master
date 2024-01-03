import {
  ACTIVITY_TYPE,
  AllFileAssetsFromAgencyResponse,
  AllFileAssetsResponse,
  AllFileAssetUuidsResponse,
  AllRecentFileAssetsResponse,
  BasicFileAssetResponse,
  DetailFileAssetResponse,
  FILE_ASSET_ACTION,
  isDeletedByDate,
  isExpiredByDate,
  RecentViewableFileAssetResponse,
  USER_TYPE,
  ViewableFileAssetFromAgencyResponse,
  ViewableFileAssetResponse,
} from '@filesg/common';

import { FileAsset } from '../../entities/file-asset';
import { FileAssetHistory } from '../../entities/file-asset-history';
import { CorporateBaseUser } from '../../entities/user';

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

function transformDetailFileAsset(fileAsset: FileAsset, authUserId?: number): DetailFileAssetResponse {
  const lastViewedHistories = fileAsset.histories?.filter((history) => history.type === FILE_ASSET_ACTION.VIEWED);

  let lastViewedHistory: FileAssetHistory | undefined;

  if (fileAsset.owner?.type === USER_TYPE.CORPORATE) {
    lastViewedHistory = lastViewedHistories?.find((history) => history.actionById === authUserId);
  } else {
    lastViewedHistory = lastViewedHistories?.[0];
  }

  return {
    ...transformBasicFileAsset(fileAsset),
    metadata: fileAsset.metadata,
    lastViewedAt: lastViewedHistory?.lastViewedAt ?? null,
  };
}

// =============================================================================
// Feature module services
// =============================================================================
export function transformAllFileAssets(
  fileAssets: FileAsset[],
  count: number,
  next: number | null,
  authUserId?: number,
): AllFileAssetsResponse {
  return {
    items: fileAssets.map((fileAsset) => {
      return transformViewableFileAsset(fileAsset, authUserId);
    }),
    count,
    next,
  };
}

export function transformRecentFileAssets(
  fileAssets: FileAsset[],
  count: number,
  next: number | null,
  authUserId?: number,
): AllRecentFileAssetsResponse {
  return {
    items: fileAssets?.map((fileAsset) => transformRecentFileAsset(fileAsset, authUserId)),
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

export function transformViewableFileAsset(fileAsset: FileAsset, authUserId?: number): ViewableFileAssetResponse {
  const eservice = fileAsset.issuer!.eservices![0];
  const receiveTransferActivity = fileAsset.activities!.find((activity) => activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER)!;
  const receiveDeleteActivity = fileAsset.activities!.find((activity) => activity.type === ACTIVITY_TYPE.RECEIVE_DELETE) ?? null;
  const { owner } = fileAsset;
  const { name: fileAssetUserName } = owner!;
  const { name: eServiceName, agency } = eservice;
  const { name: agencyName, code: agencyCode } = agency!;
  const { isAcknowledgementRequired, acknowledgedAt, uuid: receiveTransferActivityUuid } = receiveTransferActivity;
  const externalRefId = receiveTransferActivity.transaction?.application?.externalRefId ?? null;

  // For corporate, if name is null, to return UEN
  let ownerName = fileAssetUserName;

  if (owner?.type === USER_TYPE.CORPORATE) {
    const { name: corporateName, uen } = (owner as CorporateBaseUser).corporate!;
    ownerName = corporateName ?? uen;
  }

  return {
    ...transformDetailFileAsset(fileAsset, authUserId),
    agencyName,
    eServiceName,
    agencyCode,
    ownerName,
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

function transformRecentFileAsset(
  fileAsset: FileAsset,
  authUserId?: number,
): Pick<RecentViewableFileAssetResponse, 'lastViewedAt' | 'type' | 'name' | 'uuid'> {
  const { lastViewedAt } = transformDetailFileAsset(fileAsset, authUserId);
  const { documentType, name, uuid } = fileAsset;

  return {
    lastViewedAt,
    type: documentType,
    name,
    uuid,
  };
}

export function transformAllFileAssetUuids(fileAssets: FileAsset[]): AllFileAssetUuidsResponse {
  return {
    fileAssets: (fileAssets || []).map((fileAsset) => fileAsset.uuid),
  };
}
