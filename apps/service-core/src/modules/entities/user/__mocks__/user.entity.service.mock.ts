import { STATUS } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { UserEntityService } from '../user.entity.service';
import { createMockCitizenUser } from './user.mock';

export const mockUserEntityService: MockService<UserEntityService> = {
  // Retrieve
  retrieveUserById: jest.fn(),
  retrieveUserByUuid: jest.fn(),
  retrieveUserWithEserviceAndAgencyById: jest.fn(),
  retrieveUserByUin: jest.fn(),
  retrieveUserByEmail: jest.fn(),
  retrieveCountOnboardedCitizenUserTotalAndWithIssuedDocument: jest.fn(),

  // Update
  updateUserById: jest.fn(),
};

export const mockUserUuid = 'mockUser-uuid-1';

export const mockUser = createMockCitizenUser({
  uuid: mockUserUuid,
  id: 1,
  uin: 'S3002610A',
  name: 'Jason Bourne',
  email: 'jason@gmail.com',
  phoneNumber: '12345678',
  isOnboarded: true,
  status: STATUS.ACTIVE,
});
