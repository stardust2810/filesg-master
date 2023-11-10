import { AgencyCreationModel } from '../../../../entities/agency';
import { MockService } from '../../../../typings/common.mock';
import { mockNotificationMessageTemplate } from '../../notification-message-template/__mocks__/notification-message-template.entity.service.mock';
import { mockTransactionCustomMessageTemplate } from '../../transaction-custom-message-template/__mocks__/transaction-custom-message-template.entity.service.mock';
import { AgencyEntityService } from '../agency.entity.service';
import { createMockAgency } from './agency.mock';

export const mockAgencyEntityService: MockService<AgencyEntityService> = {
  buildAgency: jest.fn(),
  saveAgencies: jest.fn(),
  saveAgency: jest.fn(),
  isAgencyExistsByCode: jest.fn(),
  isAgencyExistByIdentityProofLocation: jest.fn(),
  retrieveAgencyWithEservicesByCode: jest.fn(),
  retrieveAgencyByCode: jest.fn(),
  retrieveAllAgencyNamesAndCodes: jest.fn(),
  retrieveCountAgencyAndEservices: jest.fn(),
  retrieveAgencyByCodeWithTemplatesByNames: jest.fn(),
  retrieveAgencyByIdWithFormSgTransactionAndNotificationTemplates: jest.fn(),
  retrieveAgenciesByCodes: jest.fn(),
};

export const mockAgencyUuid = 'mockAgency-uuid-1';
export const mockAgencyUuid2 = 'mockAgency-uuid-2';

export const mockAgencyModels: AgencyCreationModel[] = [
  {
    name: 'Spotify',
    code: 'SPF',
    identityProofLocation: 'spotify.com',
    transactionCustomMessageTemplates: [mockTransactionCustomMessageTemplate],
    notificationMessageTemplates: [mockNotificationMessageTemplate],
  },
  {
    name: 'Apple Music',
    code: 'AM',
    identityProofLocation: 'apple-music.com',
    transactionCustomMessageTemplates: [mockTransactionCustomMessageTemplate],
    notificationMessageTemplates: [mockNotificationMessageTemplate],
  },
];

export const mockAgency = createMockAgency({
  name: 'Spotify',
  code: 'SPF',
  identityProofLocation: 'spotify.com',
  transactionCustomMessageTemplates: [mockTransactionCustomMessageTemplate],
  notificationMessageTemplates: [mockNotificationMessageTemplate],
});
