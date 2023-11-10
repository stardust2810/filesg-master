import { BasicApplicationResponse, DetailApplicationResponse } from '@filesg/common';

import { Application } from '../../entities/application';

// =============================================================================
// Defaults
// =============================================================================
function transformBasicApplication(application: Application): BasicApplicationResponse {
  return {
    uuid: application.uuid,
    createdAt: application.createdAt,
  };
}

export function transformDetailApplication(application: Application): DetailApplicationResponse {
  return {
    ...transformBasicApplication(application),
    externalRefId: application.externalRefId,
  };
}

// =============================================================================
// Service-based
// =============================================================================
