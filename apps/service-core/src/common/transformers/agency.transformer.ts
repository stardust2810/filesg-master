import { AgencyListResponse, BasicAgencyResponse } from '@filesg/common';

import { Agency } from '../../entities/agency';

// =============================================================================
// Defaults
// =============================================================================
export function transformBasicAgency(agency: Agency): BasicAgencyResponse {
  return {
    uuid: agency.uuid,
    name: agency.name,
    code: agency.code,
    createdAt: agency.createdAt,
  };
}

export function transformBasicAgencies(agencies: { agencyCode: string; agencyName: string }[]): AgencyListResponse {
  return {
    agencies: agencies.map((agency) => {
      return {
        agencyCode: agency.agencyCode,
        agencyName: agency.agencyName,
      };
    }),
  };
}
