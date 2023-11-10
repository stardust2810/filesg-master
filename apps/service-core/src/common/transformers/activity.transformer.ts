import { ActivitiesResponse, ActivityDetailsResponse, BasicActivityResponse } from '@filesg/common';

import { Activity } from '../../entities/activity';
import { FileAsset } from '../../entities/file-asset';
import { transformBasicAgency } from './agency.transformer';
import { transformDetailApplication } from './application.transformer';
import { transformBasicEservice } from './eservice.transformer';
import { transformBasicFileAsset } from './file.transformer';

// =============================================================================
// Defaults
// =============================================================================
function transformBasicActivity(activity: Activity): BasicActivityResponse {
  return {
    uuid: activity.uuid,
    status: activity.status,
    type: activity.type,
    createdAt: activity.createdAt,
  };
}

// ===========================================================================
// Service-based
// ===========================================================================
export function transformActivityDetailsResponse(activity: Activity): ActivityDetailsResponse {
  const { fileAssets, transaction, isAcknowledgementRequired, acknowledgedAt, acknowledgementTemplate } = activity;
  const { application, customAgencyMessage, customMessage, name: transactionName } = transaction!;
  const { eservice } = application!;
  const { agency } = eservice!;

  const acknowledgementContent = acknowledgementTemplate?.content.content ?? null;

  return {
    ...transformBasicActivity(activity),
    files: fileAssets!.sort(sortActivityFileAssets).map((fileAsset) => transformBasicFileAsset(fileAsset)),
    customAgencyMessage: customAgencyMessage?.transaction || customMessage || null,
    transactionName,
    application: transformDetailApplication(application!),
    eservice: transformBasicEservice(eservice!),
    agency: transformBasicAgency(agency!),
    isAcknowledgementRequired,
    acknowledgedAt,
    acknowledgementContent,
  };
}

export function transformActivitiesResponse(activities: Activity[], count: number, next: number | null): ActivitiesResponse {
  return {
    items: activities.map((activity) => {
      const { fileAssets, transaction, isAcknowledgementRequired, acknowledgedAt } = activity;
      const { application, name: transactionName } = transaction!;
      const { eservice } = application!;
      const { agency } = eservice!;

      return {
        ...transformBasicActivity(activity),
        files: fileAssets!.sort(sortActivityFileAssets).map((fileAsset) => transformBasicFileAsset(fileAsset)),
        agency: transformBasicAgency(agency!),
        transactionName,
        isAcknowledgementRequired,
        acknowledgedAt,
      };
    }),
    count,
    next,
  };
}

function sortActivityFileAssets(a: FileAsset, b: FileAsset) {
  return b.createdAt.getTime() - a.createdAt.getTime() || a.name.localeCompare(b.name) || a.id - b.id; // DESC createdAt -> ASC name -> ASC id
}
