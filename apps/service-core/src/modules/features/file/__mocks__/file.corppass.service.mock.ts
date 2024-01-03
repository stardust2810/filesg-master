import { ROLE, STATUS, USER_TYPE } from '@filesg/common';

import { CorporateUserAuthUser } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import {
  createMockCorporate,
  createMockCorporateBaseUser,
  createMockCorporateWithBaseUser,
} from '../../../entities/user/__mocks__/user.mock';
import { CorppassFileService } from '../file.corppass.service';

export const mockCorppassFileService: MockService<CorppassFileService> = {
  generateFileSessionAndJwtForDownload: jest.fn(),
  retrieveAllFileAssets: jest.fn(),
  retrieveAllCorporateFileAssetUuids: jest.fn(),
  retrieveCorporateFileAsset: jest.fn(),
  retrieveRecentFileAssets: jest.fn(),
  retrieveFileHistory: jest.fn(),
  updateCorppassLastViewedAt: jest.fn(),
  generateVerifyToken: jest.fn(),
};

const mockCorporateBaseUser = createMockCorporateBaseUser({
  id: 2,
  uuid: 'mock-corporate-uuid-2',
  status: STATUS.ACTIVE,
});

export const mockCorporateWithBaseUser = createMockCorporateWithBaseUser({
  uen: '200000177W',
  user: mockCorporateBaseUser,
});

export const mockCorporate = createMockCorporate({ uen: '200000177W', userId: 2 });

export const mockCorporateUserAuthUser: CorporateUserAuthUser = {
  name: `corporate-auth-user`,
  maskedUin: 'S****610A',
  userId: 1,
  userUuid: 'mock-user-uuid-1',
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
