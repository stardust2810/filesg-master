import { ROLE, STATUS, USER_TYPE } from '@filesg/common';
import { TokenResponse } from '@govtechsg/singpass-myinfo-oidc-helper/dist/myinfo/helper';

import { LoginRequest } from '../../../../dtos/auth/request';
import { CitizenAuthUser, CorporateUserAuthUser, FileSGCitizenSession } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import {
  createMockCitizenUser,
  createMockCorporateBaseUser,
  createMockCorporateWithBaseUser,
} from '../../../entities/user/__mocks__/user.mock';
import { AuthService } from '../auth.service';

export const mockAuthService: MockService<AuthService> = {
  validateProgrammaticUser: jest.fn(),
  generateJWT: jest.fn(),
  ndiLogin: jest.fn(),
  updateCitizenUserSession: jest.fn(),
  getOrCreateCitizenUserUsingUin: jest.fn(),
  getUserDetailsFromMyInfo: jest.fn(),
  citizenLogout: jest.fn(),
  icaSso: jest.fn(),
  updateUserFromMcc: jest.fn(),
  updateUserNameFromMyInfo: jest.fn(),
  updateUserDetailsFromMyInfo: jest.fn(),
  getLoginContext: jest.fn(),
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

const mockCorporateBaseUser = createMockCorporateBaseUser({
  id: 2,
  uuid: 'mock-corporate-uuid-2',
  status: STATUS.ACTIVE,
});

export const mockCorporateWithBaseUser = createMockCorporateWithBaseUser({
  uen: '200000177W',
  user: mockCorporateBaseUser,
});

export const mockUserCorporateRole = createMockCorporateBaseUser({
  id: 1,
  name: 'name',
  email: 'email',
  phoneNumber: '+6587654321',
  uuid: 'mockUser-uuid-1',
  uin: 'S3002610A',
  status: STATUS.ACTIVE,
  isOnboarded: true,
});

export const mockCitizenAuthUser: CitizenAuthUser = {
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
};

export const mockCorporateUserAuthUser: CorporateUserAuthUser = {
  name: `corporate-auth-user`,
  maskedUin: 'S****610A',
  userId: mockUser.id,
  userUuid: mockUser.uuid,
  type: USER_TYPE.CORPORATE_USER,
  isOnboarded: true,
  role: ROLE.CORPORATE_USER,
  lastLoginAt: null,
  createdAt: null,
  expiresAt: new Date(),
  sessionLengthInSecs: 0,
  extendSessionWarningDurationInSecs: 0,
  hasPerformedDocumentAction: false,
  corporateUen: mockCorporateWithBaseUser.uen,
  corporateName: null,
  corporateBaseUserId: mockCorporateWithBaseUser.user!.id,
  corporateBaseUserUuid: mockCorporateWithBaseUser.user!.uuid,
  accessibleAgencies: [{ code: 'ALL', name: 'All Agencies' }],
};

export interface IdTokenPayload {
  nonce: string;
}

export const mockLoginReq: LoginRequest = { authCode: 'testAuthCode', nonce: 'testNonce' };

export const mockTokens = {} as TokenResponse;
export const mockTokenPayload = { nonce: mockLoginReq.nonce } as IdTokenPayload;

export const mockMyIcaToken = 'test';
export const mockSession = { id: 'test', user: mockCitizenAuthUser, destroy: jest.fn() } as unknown as FileSGCitizenSession;
export const mockSessionWithNonOnboardedUser = {
  id: 'test',
  user: { ...mockCitizenAuthUser, isOnboarded: false },
  destroy: jest.fn(),
} as unknown as FileSGCitizenSession;

export const mockSessionWithNamelessUser = {
  id: 'test',
  user: { ...mockCitizenAuthUser, name: null },
  destroy: jest.fn(),
} as unknown as FileSGCitizenSession;
