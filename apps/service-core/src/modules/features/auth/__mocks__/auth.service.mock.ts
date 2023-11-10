import { ROLE, STATUS, USER_TYPE } from '@filesg/common';
import { TokenResponse } from '@govtechsg/singpass-myinfo-oidc-helper/dist/myinfo/helper';

import { LoginRequest } from '../../../../dtos/auth/request';
import { AuthUser, FileSGSession } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { AuthService } from '../auth.service';

export const mockAuthService: MockService<AuthService> = {
  validateProgrammaticUser: jest.fn(),
  generateJWT: jest.fn(),
  ndiLogin: jest.fn(),
  updateSession: jest.fn(),
  getOrCreateUserUsingUin: jest.fn(),
  getUserDetailsFromMyInfo: jest.fn(),
  citizenLogout: jest.fn(),
  icaSso: jest.fn(),
  updateUserFromMcc: jest.fn(),
  updateUserNameFromMyInfo: jest.fn(),
  updateUserDetailsFromMyInfo: jest.fn(),
  getLoginContext: jest.fn(),
  updateCorporateUserSession: jest.fn(),
  getOrCreateCorporateAndCorporateUser: jest.fn(),
  handleAgencyNameCaching: jest.fn(),
};

export const mockUser = createMockCitizenUser({
  id: 1,
  name: 'name',
  email: 'email',
  phoneNumber: '+6587654321',
  uuid: 'mockUser-uuid-1',
  uin: 'S3002610A',
  status: STATUS.ACTIVE,
  isOnboarded: true,
});

export const mockAuthUser: AuthUser = {
  name: `auth-user`,
  maskedUin: 'S****610A',
  userId: mockUser.id,
  userUuid: mockUser.uuid,
  type: USER_TYPE.CITIZEN,
  isOnboarded: mockUser.isOnboarded,
  role: ROLE.CITIZEN,
  lastLoginAt: null,
  createdAt: null,
  expiresAt: new Date(),
  sessionLengthInSecs: 0,
  extendSessionWarningDurationInSecs: 0,
  ssoEservice: null,
  hasPerformedDocumentAction: false,
  corporateUen: null,
  corporateName: null,
  accessibleAgencies: null,
};

export interface IdTokenPayload {
  nonce: string;
}

export const mockLoginReq: LoginRequest = { authCode: 'testAuthCode', nonce: 'testNonce' };

export const mockTokens = {} as TokenResponse;
export const mockTokenPayload = { nonce: mockLoginReq.nonce } as IdTokenPayload;

export const mockMyIcaToken = 'test';
export const mockSession = { id: 'test', user: mockAuthUser, destroy: jest.fn() } as unknown as FileSGSession;
export const mockSessionWithNonOnboardedUser = {
  id: 'test',
  user: { ...mockAuthUser, isOnboarded: false },
  destroy: jest.fn(),
} as unknown as FileSGSession;

export const mockSessionWithNamelessUser = {
  id: 'test',
  user: { ...mockAuthUser, name: null },
  destroy: jest.fn(),
} as unknown as FileSGSession;
