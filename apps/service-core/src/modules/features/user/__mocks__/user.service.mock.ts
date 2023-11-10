import { STATUS } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { UserService } from '../user.service';

export const mockUserService: MockService<UserService> = {
  retrieveUserDetail: jest.fn(),
  checkDuplicateEmail: jest.fn(),
  onboardCitizenUser: jest.fn(),
  getAgencyList: jest.fn(),
};

export const mockUser = createMockCitizenUser({
  id: 1,
  uin: 'S9203266C',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
});
