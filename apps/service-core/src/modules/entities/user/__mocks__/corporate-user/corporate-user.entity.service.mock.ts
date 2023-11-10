import { STATUS } from '@filesg/common';

import { CorporateCreationModel } from '../../../../../entities/corporate';
import { CorporateUserCreationModel, CorporateUserWithBaseUserCreationModel } from '../../../../../entities/corporate-user';
import { MockService, TestCreationModel } from '../../../../../typings/common.mock';
import { CorporateUserEntityService } from '../../corporate-user/corporate-user.entity.service';
import { createMockCorporate, createMockCorporateUser, createMockCorporateUserWithBaseUser } from '../user.mock';

export const mockCorporateUserEntityService: MockService<CorporateUserEntityService> = {
  buildCorporateUser: jest.fn(),
  buildCorporateUserWithBaseUser: jest.fn(),
  insertCorporateUsers: jest.fn(),
  saveCorporateUsers: jest.fn(),
  saveCorporateUsersWithBaseUsers: jest.fn(),
  saveCorporateUserWithBaseUser: jest.fn(),
  retrieveCorporateUserWithBaseUserByUinAndCorporateId: jest.fn(),
  updateCorporateUserById: jest.fn(),
};

export const mockCorporateUserUin1 = 'mockCorporateUserUin1';
export const mockCorporateUserUen1 = 'mockCorporateUserUen1';
export const mockCorporateUserUen2 = 'mockCorporateUserUen2';

export const mockCorporateId1 = 1;
export const mockCorporateId2 = 2;
export const mockCorporateUserUuid1 = 'mockCorporateUserUuid1';
export const mockCorporateUserUuid2 = 'mockCorporateUserUuid2';

export const mockCorporateCreationModel1: TestCreationModel<CorporateCreationModel> = {
  id: mockCorporateId1,
  uen: mockCorporateUserUen1,
};

export const mockCorporateCreationModel2: TestCreationModel<CorporateCreationModel> = {
  id: mockCorporateId2,
  uen: mockCorporateUserUen2,
};

export const mockCorporate1 = createMockCorporate(mockCorporateCreationModel1);
export const mockCorporate2 = createMockCorporate(mockCorporateCreationModel2);

export const mockCorporateUserCreationModel1: CorporateUserCreationModel = {
  uin: mockCorporateUserUin1,
  corporate: mockCorporate1,
};

export const mockCorporateUserCreationModel2: CorporateUserCreationModel = {
  uin: 'mockCorporateUserUin2',
  corporate: mockCorporate2,
};

export const mockCorporateUserWithBaseUserCreationModel1: CorporateUserWithBaseUserCreationModel = {
  ...mockCorporateUserCreationModel1,
  user: {
    status: STATUS.ACTIVE,
  },
};

export const mockCorporateUserWithBaseUserCreationModel2: CorporateUserWithBaseUserCreationModel = {
  ...mockCorporateUserCreationModel2,
  user: {
    status: STATUS.ACTIVE,
  },
};

export const mockCorporateUser1 = createMockCorporateUser(mockCorporateUserCreationModel1);

export const mockCorporateUser2 = createMockCorporateUser(mockCorporateUserCreationModel2);

export const mockCorporateUserWithBaseUser1 = createMockCorporateUserWithBaseUser(mockCorporateUserWithBaseUserCreationModel1);

export const mockCorporateUserWithBaseUser2 = createMockCorporateUserWithBaseUser(mockCorporateUserWithBaseUserCreationModel2);
