import { USER_TYPE, UserSessionDetailsResponse } from '@filesg/common';

import { AuthUser } from '../../typings/common';

// ===========================================================================
// Service-based
// ===========================================================================
export function transformUserSessionDetailsResponse(userSession: AuthUser): UserSessionDetailsResponse {
  const {
    userUuid,
    name,
    type,
    role,
    isOnboarded,
    lastLoginAt,
    createdAt,
    expiresAt,
    sessionLengthInSecs,
    extendSessionWarningDurationInSecs,
  } = userSession;

  return {
    uuid: userUuid,
    name,
    type,
    maskedUin: type === USER_TYPE.CITIZEN || type === USER_TYPE.CORPORATE_USER ? userSession.maskedUin : null,
    role,
    isOnboarded,
    lastLoginAt,
    createdAt,
    expiresAt,
    sessionLengthInSecs,
    extendSessionWarningDurationInSecs,
    ssoEservice: type === USER_TYPE.CITIZEN ? userSession.ssoEservice : null,
    corporateUen: type === USER_TYPE.CORPORATE_USER ? userSession.corporateUen : null,
    corporateName: type === USER_TYPE.CORPORATE_USER ? userSession.corporateName : null,
    accessibleAgencies: type === USER_TYPE.CORPORATE_USER ? userSession.accessibleAgencies : null,
  };
}
