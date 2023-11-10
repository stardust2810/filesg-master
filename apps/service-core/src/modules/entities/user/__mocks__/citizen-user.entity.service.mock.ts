import { STATUS } from '@filesg/common';

import { CitizenUserCreationModel } from '../../../../entities/user';
import { MockService } from '../../../../typings/common.mock';
import { CitizenUserEntityService } from '../citizen-user.entity.service';
import { createMockCitizenUser } from './user.mock';

export const mockCitizenUserEntityService: MockService<CitizenUserEntityService> = {
  // create
  buildCitizenUser: jest.fn(),
  insertCitizenUsers: jest.fn(),
  saveCitizenUsers: jest.fn(),
  saveCitizenUser: jest.fn(),

  // retrieve
  retrieveCitizenUserById: jest.fn(),

  // update
  updateCitizenUserById: jest.fn(),

  // delete
};

export const mockCitizenUserUuid = 'mockCitizenUser-uuid-1';
export const mockCitizenUserUuid2 = 'mockCitizenUser-uuid-2';

export const mockCitizenUser = createMockCitizenUser({
  uuid: mockCitizenUserUuid,
  id: 1,
  uin: 'S3002610A',
  name: 'Jason Bourne',
  email: 'jason@gmail.com',
  phoneNumber: '12345678',
  isOnboarded: true,
  status: STATUS.ACTIVE,
});

export const mockCitizenUserModels: CitizenUserCreationModel[] = [
  {
    uin: 'S3002610A',
    name: 'Jason Bourne',
    email: 'jason@gmail.com',
    phoneNumber: '12345678',
    isOnboarded: true,
    status: STATUS.ACTIVE,
  },
  {
    uin: 'S3002611A',
    name: 'Iron Man',
    email: 'ironMan@gmail.com',
    phoneNumber: '12345678',
    isOnboarded: true,
    status: STATUS.ACTIVE,
  },
];
