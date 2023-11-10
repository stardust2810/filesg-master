import { STATUS } from '@filesg/common';

import { CorporateCreationModel, CorporateWithBaseUserCreationModel } from '../../../../../entities/corporate';
import { MockService } from '../../../../../typings/common.mock';
import { CorporateEntityService } from '../../corporate/corporate.entity.service';
import { createMockCorporate, createMockCorporateWithBaseUser } from '../user.mock';

export const mockCorporateEntityService: MockService<CorporateEntityService> = {
  buildCorporate: jest.fn(),
  saveCorporateWithBaseUser: jest.fn(),
  retrieveCorporateByUen: jest.fn(),
  buildCorporateWithBaseUser: jest.fn(),
  insertCorporates: jest.fn(),
  saveCorporates: jest.fn(),
  saveCorporatesWithBaseUsers: jest.fn(),
  retrieveCorporateWithBaseUserByUen: jest.fn(),
};

export const mockCorporateUuid1 = 'mockCorporateUuid1';
export const mockCorporateUuid2 = 'mockCorporateUuid2';
export const mockCorporateUen1 = 'mockCorporateUen1';
export const mockCorporateUen2 = 'mockCorporateUen2';

export const mockCorporateCreationModel1: CorporateCreationModel = {
  uen: mockCorporateUen1,
};

export const mockCorporateCreationModel2: CorporateCreationModel = {
  uen: mockCorporateUen2,
};

export const mockCorporateWithBaseUserCreationModel1: CorporateWithBaseUserCreationModel = {
  ...mockCorporateCreationModel1,
  user: {
    status: STATUS.ACTIVE,
  },
};

export const mockCorporateWithBaseUserCreationModel2: CorporateWithBaseUserCreationModel = {
  ...mockCorporateCreationModel2,
  user: {
    status: STATUS.ACTIVE,
  },
};

export const mockCorporate1 = createMockCorporate(mockCorporateCreationModel1);

export const mockCorporate2 = createMockCorporate(mockCorporateCreationModel2);

export const mockCorporateWithBaseUser1 = createMockCorporateWithBaseUser(mockCorporateWithBaseUserCreationModel1);

export const mockCorporateWithBaseUser2 = createMockCorporateWithBaseUser(mockCorporateWithBaseUserCreationModel2);
