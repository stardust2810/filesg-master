import { STATUS } from '@filesg/common';

import { ProgrammaticUserCreationModel } from '../../../../entities/user';
import { MockService } from '../../../../typings/common.mock';
import { createMockEservice } from '../../eservice/__mocks__/eservice.mock';
import { ProgrammaticUserEntityService } from '../programmatic-user.entity.service';
import { createMockProgrammaticUser } from './user.mock';

export const mockProgrammaticUserEntityService: MockService<ProgrammaticUserEntityService> = {
  // Create
  buildProgrammaticUser: jest.fn(),
  insertProgrammaticUsers: jest.fn(),
  saveProgrammaticUsers: jest.fn(),

  // Read
  retrieveProgrammaticUserByClientId: jest.fn(),
  retrieveAllEservicesProgrammaticUsersByUserId: jest.fn(),
};

export const mockProgrammaticUserUuid = 'mockProgrammaticUser-uuid-1';
export const mockProgrammaticUserUuid2 = 'mockProgrammaticUser-uuid-2';

export const mockProgrammaticUser2 = createMockProgrammaticUser({
  uuid: mockProgrammaticUserUuid2,
  id: 2,
  isOnboarded: true,
  status: STATUS.ACTIVE,
  clientId: 'user-client-2',
  clientSecret: 'user-client-secret-2',
});

export const mockEservice = createMockEservice({
  name: 'ICA',
  emails: ['ica@gmail.com'],
  users: [mockProgrammaticUser2],
});

export const mockProgrammaticUser = createMockProgrammaticUser({
  uuid: mockProgrammaticUserUuid,
  id: 1,
  isOnboarded: true,
  status: STATUS.ACTIVE,
  clientId: 'user-client-1',
  clientSecret: 'user-client-secret-1',
  eservices: [mockEservice],
});

export const mockProgrammaticUserModels: ProgrammaticUserCreationModel[] = [
  {
    isOnboarded: true,
    status: STATUS.ACTIVE,
    clientId: 'user-client-1',
    clientSecret: 'user-client-secret-1',
  },
  {
    isOnboarded: true,
    status: STATUS.ACTIVE,
    clientId: 'user-client-1',
    clientSecret: 'user-client-secret-1',
  },
];
