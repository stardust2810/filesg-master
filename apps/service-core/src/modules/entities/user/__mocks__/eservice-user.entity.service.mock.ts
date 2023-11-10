import { ROLE, STATUS } from '@filesg/common';

import { EserviceUserCreationModel } from '../../../../entities/user';
import { MockService } from '../../../../typings/common.mock';
import { createMockEserviceWhitelistedUser } from '../../eservice-whitelisted-user/__mocks__/eservice-whitelisted-user.mock';
import { EserviceUserEntityService } from '../eservice-user.entity.service';
import { createMockEserviceUser } from './user.mock';

export const mockEserviceUserEntityService: MockService<EserviceUserEntityService> = {
  buildEserviceUser: jest.fn(),
  insertEserviceUsers: jest.fn(),
  saveEserviceUsers: jest.fn(),
  retrieveEserviceUserByActiveWhitelistEmail: jest.fn(),
  retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName: jest.fn(),
  retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails: jest.fn(),
};

export const mockEserviceWhitelistedUser = createMockEserviceWhitelistedUser({
  email: 'test@test.email',
  status: STATUS.ACTIVE,
});

export const mockEserviceUser = createMockEserviceUser({
  uuid: 'mockEserviceUser-uuid-1',
  id: 1,
  isOnboarded: true,
  status: STATUS.ACTIVE,
  role: ROLE.FORMSG,
  whitelistedUsers: [mockEserviceWhitelistedUser],
});

export const mockEserviceUser2 = createMockEserviceUser({
  uuid: 'mockEserviceUser-uuid-2',
  id: 1,
  isOnboarded: true,
  status: STATUS.ACTIVE,
  role: ROLE.FORMSG,
  whitelistedUsers: [],
});

export const mockEserviceUserModels: EserviceUserCreationModel[] = [
  {
    isOnboarded: true,
    status: STATUS.ACTIVE,
    whitelistedUsers: [mockEserviceWhitelistedUser],
  },
  {
    isOnboarded: true,
    status: STATUS.ACTIVE,
    whitelistedUsers: [],
  },
];
