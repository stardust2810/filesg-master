// ===========================================================================
// Service-based

import { UserSessionDetailsResponse } from '@filesg/common';

import { AuthUser } from '../../typings/common';

// ===========================================================================
export function transformUserSessionDetailsResponse(userSession: AuthUser): UserSessionDetailsResponse {
  const {
    userUuid,
    name,
    type,
    maskedUin,
    role,
    isOnboarded,
    lastLoginAt,
    createdAt,
    expiresAt,
    sessionLengthInSecs,
    extendSessionWarningDurationInSecs,
    ssoEservice,
    corporateUen,
    corporateName,
    accessibleAgencies,
  } = userSession;

  return {
    uuid: userUuid,
    name,
    type,
    maskedUin,
    role,
    isOnboarded,
    lastLoginAt,
    createdAt,
    expiresAt,
    sessionLengthInSecs,
    extendSessionWarningDurationInSecs,
    ssoEservice,
    corporateUen,
    corporateName,
    accessibleAgencies,
  };
}
