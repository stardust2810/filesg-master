import { BasicEserviceResponse } from '@filesg/common';

import { Eservice } from '../../entities/eservice';

// =============================================================================
// Defaults
// =============================================================================
export function transformBasicEservice(eservice: Eservice): BasicEserviceResponse {
  return {
    uuid: eservice.uuid,
    name: eservice.name,
    createdAt: eservice.createdAt,
  };
}
// =============================================================================
// Service-based
// =============================================================================
