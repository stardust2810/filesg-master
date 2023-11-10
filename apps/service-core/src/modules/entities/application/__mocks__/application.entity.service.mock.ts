import { ApplicationCreationModel } from '../../../../entities/application';
import { MockService } from '../../../../typings/common.mock';
import { ApplicationEntityService } from '../application.entity.service';
import { createMockApplication } from './application.mock';

export const mockApplicationEntityService: MockService<ApplicationEntityService> = {
  // Create
  buildApplication: jest.fn(),
  insertApplications: jest.fn(),
  saveApplications: jest.fn(),
  saveApplication: jest.fn(),

  // Read
  retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId: jest.fn(),
  retrieveApplicationByTransactionUuid: jest.fn(),
  retrieveApplicationWithTransactionsAndActivitiesDetailsByExternalRefId: jest.fn(),
  retrieveApplicationsWithTransactionsAndActivitiesDetailsByIds: jest.fn(),
  retrieveApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes: jest.fn(),
  retrieveApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo: jest.fn(),

  // Update
  upsertApplication: jest.fn(),
};

export const mockApplicationUuid = 'mockApplication-uuid-1';
export const mockApplicationUuid2 = 'mockApplication-uuid-2';

export const mockApplication = createMockApplication({
  externalRefId: 'test-ref-id-1',
});

export const mockApplicationModels: ApplicationCreationModel[] = [
  {
    externalRefId: 'test-ref-id-1',
  },
  {
    externalRefId: 'test-ref-id-2',
  },
];
