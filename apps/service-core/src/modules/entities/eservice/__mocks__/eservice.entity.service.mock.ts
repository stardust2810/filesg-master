import { EserviceCreationModel } from '../../../../entities/eservice';
import { MockService } from '../../../../typings/common.mock';
import { EserviceEntityService } from '../eservice.entity.service';
import { createMockEservice } from './eservice.mock';

export const mockEserviceEntityService: MockService<EserviceEntityService> = {
  buildEservice: jest.fn(),
  saveEservices: jest.fn(),
  saveEservice: jest.fn(),
  insertEservices: jest.fn(),
  associateUsersToEservice: jest.fn(),
  associateApplicationTypeToEservice: jest.fn(),
  retrieveEserviceByUserId: jest.fn(),
  retrieveEserviceByAgencyId: jest.fn(),
  retrieveEserviceByAgencyCodeAndEserviceName: jest.fn(),
};

export const mockEservice = createMockEservice({
  name: 'ICA',
  emails: ['ica@gmail.com'],
});

export const mockEserviceUuid = 'mockEservice-uuid-1';
export const mockEserviceUuid2 = 'mockEservice-uuid-2';

export const mockEserviceModels: EserviceCreationModel[] = [
  { name: 'ICA', emails: ['ica@gmail.com'] },
  { name: 'CIRIS', emails: ['ciris@gmail.com'] },
];
