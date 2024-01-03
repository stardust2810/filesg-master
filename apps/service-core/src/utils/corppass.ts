import { AccessibleAgency } from '@filesg/common';
import { isEmpty } from 'lodash';

export interface AgencyAccessResult {
  agencyCodesToAccess: string[];
  userHasAccessToAll: boolean;
}

export const assertAccessibleAgencies = (
  accessibleAgencies: AccessibleAgency[],
  agencyCodesFromQuery: string[] | undefined,
): AgencyAccessResult => {
  const agencyCodesToAccess: string[] = [];
  const accessibleAgencyCodes = accessibleAgencies.map(({ code }) => code);
  const userHasAccessToAll = accessibleAgencyCodes.includes('ALL');
  const isAccessingAll = agencyCodesFromQuery?.includes('ALL');

  if (isEmpty(accessibleAgencyCodes)) {
    return { agencyCodesToAccess: [], userHasAccessToAll };
  }

  if (!agencyCodesFromQuery || isEmpty(agencyCodesFromQuery) || isAccessingAll) {
    return { agencyCodesToAccess: userHasAccessToAll ? [] : accessibleAgencyCodes, userHasAccessToAll };
  }

  if (!userHasAccessToAll) {
    agencyCodesFromQuery.forEach((code) => {
      if (accessibleAgencyCodes.includes(code)) {
        agencyCodesToAccess.push(code);
      }
    });
  } else {
    agencyCodesToAccess.push(...agencyCodesFromQuery);
  }

  return { agencyCodesToAccess, userHasAccessToAll };
};
