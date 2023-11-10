import { MockRepository } from '../../../../typings/common.mock';
import { EserviceEntityRepository } from '../eservice.entity.repository';
import { createMockEservice } from './eservice.mock';

export const mockEserviceEntityRepository: MockRepository<EserviceEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockEservice(arg)),
    find: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  }),
  findByUuid: jest.fn(),
  findByAgencyId: jest.fn(),
  findEserviceByUserId: jest.fn(),
  findEserviceByAgencyCodeAndEserviceName: jest.fn(),
};
