import { MockRepository } from '../../../../typings/common.mock';
import { ApplicationEntityRepository } from '../application.entity.repository';
import { createMockApplication } from './application.mock';

export const mockApplicationEntityRepository: MockRepository<ApplicationEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockApplication(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
  }),
  findApplicationByUuid: jest.fn(),
  findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId: jest.fn(),
  findApplicationByTransactionUuid: jest.fn(),
  findApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes: jest.fn(),
  findApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo: jest.fn(),
  findApplicationWithTransactionsAndActivitiesDetailsByExternalRefId: jest.fn(),
  findApplicationsWithTransactionsAndActivitiesDetailsByIds: jest.fn(),
};
