import { MockRepository } from '../../../../typings/common.mock';
import { createMockEservice } from '../../eservice/__mocks__/eservice.mock';
import { AuditEventEntityRepository } from '../audit-event.entity.repository';

export const mockAuditEventEntityRepository: MockRepository<AuditEventEntityRepository> = {
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
  findAuditEvents: jest.fn(),
  findAgencyAndApplicationTypeEventCountsByEventNames: jest.fn(),
  findUserActionsAuditEvents: jest.fn(),
  updateAuditEventDataBySubEventName: jest.fn(),
};
