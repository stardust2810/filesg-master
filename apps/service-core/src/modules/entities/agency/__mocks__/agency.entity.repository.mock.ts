import { MockRepository } from '../../../../typings/common.mock';
import { AgencyEntityRepository } from '../agency.entity.repository';
import { createMockAgency } from './agency.mock';

export const mockAgencyEntityRepository: MockRepository<AgencyEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockAgency(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
  }),
  findByCode: jest.fn(),
  findByIdentityProofLocation: jest.fn(),
  findAgencyWithEservicesByCode: jest.fn(),
  findAllAgencyNamesAndCodes: jest.fn(),
  findCountAgencyAndEservices: jest.fn(),
  findAgencyByCodeWithTemplatesByNames: jest.fn(),
  findAgencyByIdWithFormSgTransactionAndNotificationTemplates: jest.fn(),
  findAgenciesByCodes: jest.fn(),
};
