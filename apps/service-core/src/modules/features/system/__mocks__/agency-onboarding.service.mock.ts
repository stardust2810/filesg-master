import {
  AddNotificationTemplatesRequest,
  AddTransactionTemplatesRequest,
  AgencyOnboardingApplicationTypeRequest,
  AgencyOnboardingEserviceAcknowledgementTemplateRequest,
  AgencyOnboardingEserviceRequest,
  AgencyOnboardingRequest,
  AgencyUserOnboardingDetails,
  AgencyUsersOnboardingRequest,
  ContentType,
  EserviceAcknowledgementTemplateOnboardingEserviceRequest,
  EserviceOnboardingRequest,
  EserviceUserOnboardingRequestDetails,
  EserviceWhitelistedUsersOnboardingRequest,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  NotificationTemplateOnboardingRequest,
  NotificationTemplateUpdateRequest,
  ProgrammaticUserOnboardingRequestDetails,
  ROLE,
  STATUS,
  TransactionTemplateOnboardingRequest,
  USER_TYPE,
} from '@filesg/common';
import { EntityManager } from 'typeorm';

import { Agency } from '../../../../entities/agency';
import { Eservice } from '../../../../entities/eservice';
import { EserviceUser } from '../../../../entities/user';
import { AgencyUsers, EserviceUserInput, ProgrammaticUserInput, UserToEserviceInsertableInput } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockAcknowledgementTemplate } from '../../../entities/acknowledgement-template/__mocks__/acknowledgement-template.mock';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplicationType } from '../../../entities/application-type/__mocks__/application-type.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockEserviceWhitelistedUser } from '../../../entities/eservice-whitelisted-user/__mocks__/eservice-whitelisted-user.mock';
import { createMockNotificationMessageTemplate } from '../../../entities/notification-message-template/__mocks__/notification-message-template.mock';
import { createMockTransactionCustomMessageTemplate } from '../../../entities/transaction-custom-message-template/__mocks__/transaction-custom-message-template.mock';
import { createMockEserviceUser, createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { AgencyOnboardingService } from '../agency-onboarding.service';

export const mockAgencyOnboardingService: MockService<AgencyOnboardingService> = {
  onboardNewAgency: jest.fn(),
  onboardNewEservices: jest.fn(),
  onboardNewEserviceAcknowledgementTemplate: jest.fn(),
  onboardNewTransactionCustomMessageTemplate: jest.fn(),
  updateTransactionCustomMessageTemplate: jest.fn(),
  onboardNewNotificationMessageTemplate: jest.fn(),
  updateNotificationMessageTemplate: jest.fn(),
  onboardNewAgencyUsers: jest.fn(),
  onboardNewEserviceWhitelistedUsers: jest.fn(),
  inactivateNewEserviceWhitelistedUsers: jest.fn(),
};

// =============================================================================
// Test service
// =============================================================================
export class TestAgencyOnboardingService extends AgencyOnboardingService {
  public createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates(
    agency: Agency,
    input: AgencyOnboardingRequest | EserviceOnboardingRequest,
    entityManager: EntityManager,
  ) {
    return super.createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates(agency, input, entityManager);
  }

  public createAndSaveEservicesWithCascadeEntities(
    agencyId: number,
    inputEservices: AgencyOnboardingEserviceRequest[],
    entityManager: EntityManager,
  ) {
    return super.createAndSaveEservicesWithCascadeEntities(agencyId, inputEservices, entityManager);
  }

  public generateEserviceAndCascadeEntitiesInsertables(agencyId: number, inputEservices: AgencyOnboardingEserviceRequest[]) {
    return super.generateEserviceAndCascadeEntitiesInsertables(agencyId, inputEservices);
  }

  public createProgrammaticUsers(programmaticUserInputs: ProgrammaticUserInput[], entityManager: EntityManager) {
    return super.createProgrammaticUsers(programmaticUserInputs, entityManager);
  }

  public createEserviceUsers(eserviceUserInputs: EserviceUserInput[], entityManager: EntityManager): Promise<EserviceUser[]> {
    return super.createEserviceUsers(eserviceUserInputs, entityManager);
  }

  public createAgencyUsers(users: AgencyUserOnboardingDetails, entityManager: EntityManager): Promise<AgencyUsers> {
    return super.createAgencyUsers(users, entityManager);
  }

  public createAcknowledgementTemplates(
    inputEservices: AgencyOnboardingEserviceRequest[] | EserviceAcknowledgementTemplateOnboardingEserviceRequest[],
    eservices: Eservice[],
    entityManager: EntityManager,
  ) {
    return super.createAcknowledgementTemplates(inputEservices, eservices, entityManager);
  }

  public createTransactionCustomMessageTemplates(
    transactionTemplateOnboardingRequests: TransactionTemplateOnboardingRequest[],
    agency: Agency,
    entityManager?: EntityManager,
  ) {
    return super.createTransactionCustomMessageTemplates(transactionTemplateOnboardingRequests, agency, entityManager);
  }

  public createNotificationMessageTemplates(
    notificationTemplateOnboardingRequests: NotificationTemplateOnboardingRequest[],
    agency: Agency,
    entityManager?: EntityManager,
  ) {
    return super.createNotificationMessageTemplates(notificationTemplateOnboardingRequests, agency, entityManager);
  }

  public updateNotificationMessageTemplateAndCreateAudit(
    notificationMessageTemplateUpdateRequest: NotificationTemplateUpdateRequest,
    entityManager?: EntityManager,
  ): Promise<{ uuid: string; name: string }> {
    return super.updateNotificationMessageTemplateAndCreateAudit(notificationMessageTemplateUpdateRequest, entityManager);
  }

  public createFormSgIssuanceAgencyTransactionAndNotificationTemplates(
    agency: Agency,
    createTransactionTemplate: boolean,
    notificationChannels: NOTIFICATION_CHANNEL[],
    entityManager: EntityManager,
  ): Promise<void> {
    return super.createFormSgIssuanceAgencyTransactionAndNotificationTemplates(
      agency,
      createTransactionTemplate,
      notificationChannels,
      entityManager,
    );
  }

  public generateProgrammaticUserInsertables(programmaticUserInputs: ProgrammaticUserInput[]) {
    return super.generateProgrammaticUserInsertables(programmaticUserInputs);
  }

  public generateEserviceUserInsertables(eserviceUserInputs: EserviceUserInput[]) {
    return super.generateEserviceUserInsertables(eserviceUserInputs);
  }

  public associateUsersToEservice(insertableInputs: UserToEserviceInsertableInput[], entityManager: EntityManager) {
    return super.associateUsersToEservice(insertableInputs, entityManager);
  }

  public generateEserviceToUserInsertables(insertableInputs: UserToEserviceInsertableInput[]): { eserviceId: number; userId: number }[] {
    return super.generateEserviceToUserInsertables(insertableInputs);
  }

  public extractDynamicFieldsFromTemplate(name: string, template: string[]) {
    return super.extractDynamicFieldsFromTemplate(name, template);
  }
}

// =============================================================================
// Mock data
// =============================================================================
// onboardNewAgency
const mockEservice4 = createMockEservice({
  name: 'mockEservice4',
  emails: ['mockEservice4Email1', 'mockEservice4Email2'],
});

export const mockAgency = createMockAgency({
  name: 'mockAgencyName',
  code: 'mockAgencyCode',
  eservices: [mockEservice4],
});

export const mockEservice1 = createMockEservice({
  name: 'mockEservice1',
  emails: ['mockEservice1Email1', 'mockEservice1Email2'],
});

export const mockEservice2 = createMockEservice({
  name: 'mockEservice2',
  emails: ['mockEservice2Email1', 'mockEservice2Email2'],
});

export const mockEservice3 = createMockEservice({
  name: 'mockEservice3',
  emails: ['mockEservice3Email1', 'mockEservice3Email2'],
});

export const mockProgrammaticWriteUser1 = createMockProgrammaticUser({
  role: ROLE.PROGRAMMATIC_WRITE,
  status: STATUS.ACTIVE,
  clientId: 'mockProgrammaticWriteUser1ClientId',
  clientSecret: 'mockProgrammaticWriteUser1ClientSecret',
});

export const mockProgrammaticWriteUser2 = createMockProgrammaticUser({
  role: ROLE.PROGRAMMATIC_READ,
  status: STATUS.ACTIVE,
  clientId: 'mockProgrammaticWriteUser2ClientId',
  clientSecret: 'mockProgrammaticWriteUser2ClientSecret',
});

export const mockProgrammaticReadUser1 = createMockProgrammaticUser({
  role: ROLE.PROGRAMMATIC_READ,
  status: STATUS.ACTIVE,
  clientId: 'mockProgrammaticReadUser1ClientId',
  clientSecret: 'mockProgrammaticReadUser1ClientSecret',
});

export const mockProgrammaticReadUser2 = createMockProgrammaticUser({
  role: ROLE.PROGRAMMATIC_READ,
  status: STATUS.ACTIVE,
  clientId: 'mockProgrammaticReadUser2ClientId',
  clientSecret: 'mockProgrammaticReadUser2ClientSecret',
});

export const mockEserviceWhitelistedUser1 = createMockEserviceWhitelistedUser({
  email: 'mockEserviceWhitelistedUserEmail1',
  status: STATUS.ACTIVE,
});

const mockEserviceWhitelistedUser2 = createMockEserviceWhitelistedUser({
  email: 'mockEserviceWhitelistedUserEmail2',
  status: STATUS.ACTIVE,
});

export const mockEserviceFormSgUser1 = createMockEserviceUser({
  role: ROLE.FORMSG,
  status: STATUS.ACTIVE,
});

export const mockEserviceFormSgUser2 = createMockEserviceUser({
  role: ROLE.FORMSG,
  status: STATUS.ACTIVE,
});

const mockApplicationType1 = createMockApplicationType({
  name: 'mockApplicationType1',
  code: 'MATONE',
});

const mockApplicationType2 = createMockApplicationType({
  name: 'mockApplicationType2',
  code: 'MATTWO',
});

const mockAgencyOnboardingApplicationTypeRequest1: AgencyOnboardingApplicationTypeRequest = {
  name: mockApplicationType1.name,
  code: mockApplicationType1.code,
  notificationChannels: [NOTIFICATION_CHANNEL.EMAIL],
};

const mockAgencyOnboardingApplicationTypeRequest2: AgencyOnboardingApplicationTypeRequest = {
  name: mockApplicationType2.name,
  code: mockApplicationType2.code,
  notificationChannels: [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.SG_NOTIFY],
};

export const mockTransactionCustomMessageTemplate1 = createMockTransactionCustomMessageTemplate({
  name: 'mockTransactionTemplate1',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  template: ['mockTransactionTemplate1 with {{mockRequiredField1}} and {{mockRequiredField2}}'],
});

export const mockTransactionCustomMessageTemplate2 = createMockTransactionCustomMessageTemplate({
  name: 'mockTransactionTemplate2',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  template: ['mockTransactionTemplate2 with {{mockRequiredField1}} and {{mockRequiredField2}}'],
});

const mockTransactionTemplateOnboardingRequest1: TransactionTemplateOnboardingRequest = {
  name: mockTransactionCustomMessageTemplate1.name,
  type: mockTransactionCustomMessageTemplate1.type,
  template: mockTransactionCustomMessageTemplate1.template,
};

const mockTransactionTemplateOnboardingRequest2: TransactionTemplateOnboardingRequest = {
  name: mockTransactionCustomMessageTemplate2.name,
  type: mockTransactionCustomMessageTemplate2.type,
  template: mockTransactionCustomMessageTemplate2.template,
};

export const mockEmailNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mockEmailTemplate',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  template: ['mockEmailTemplate1 with {{mockRequiredField1}} and {{mockRequiredField2}}'],
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

const mockEmailNotificationTemplateOnboardingRequest: NotificationTemplateOnboardingRequest = {
  name: mockEmailNotificationMessageTemplate.name,
  type: mockEmailNotificationMessageTemplate.type,
  template: mockEmailNotificationMessageTemplate.template,
  notificationChannel: mockEmailNotificationMessageTemplate.notificationChannel,
};

export const mockNotifyNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mockTransactionTemplate',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  template: ['mockTransactionTemplate1 with {{mockRequiredField1}} and {{mockRequiredField2}}'],
  notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  externalTemplateId: 'mockExternalTemplateId',
});

const mockNotifyNotificationTemplateOnboardingRequest: NotificationTemplateOnboardingRequest = {
  name: mockNotifyNotificationMessageTemplate.name,
  type: mockNotifyNotificationMessageTemplate.type,
  template: mockNotifyNotificationMessageTemplate.template,
  notificationChannel: mockNotifyNotificationMessageTemplate.notificationChannel,
  externalTemplateId: mockNotifyNotificationMessageTemplate.externalTemplateId!,
};

export const mockAcknowledgemenTemplate = createMockAcknowledgementTemplate({
  name: ' mockAcknowledgementTemplate',
  content: {
    content: [
      {
        content: ['Content Only'],
      },
      {
        content: ['It can also', 'be like this wor'],
        contentType: ContentType.ORDERED,
      },
    ],
  },
});

const mockAgencyOnboardingEserviceAcknowledgementTemplateRequest: AgencyOnboardingEserviceAcknowledgementTemplateRequest[] = [
  {
    name: mockAcknowledgemenTemplate.name,

    content: [
      {
        content: ['Content Only'],
      },
      {
        content: ['It can also', 'be like this wor'],
        contentType: ContentType.ORDERED,
      },
    ],
  },
];

export const mockAgencyOnboardingRequest: AgencyOnboardingRequest = {
  agencyName: mockAgency.name,
  agencyCode: mockAgency.code,
  identityProofLocation: 'mockIdentityProofLocation',
  eservices: [
    {
      name: mockEservice1.name,
      emails: mockEservice1.emails,
      users: [
        { type: mockProgrammaticWriteUser1.type, role: ROLE.PROGRAMMATIC_WRITE },
        { type: mockProgrammaticReadUser1.type, role: ROLE.PROGRAMMATIC_READ },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest1],
      acknowledgementTemplates: mockAgencyOnboardingEserviceAcknowledgementTemplateRequest,
    },
    {
      name: mockEservice2.name,
      emails: mockEservice2.emails,
      users: [
        { type: mockProgrammaticReadUser2.type, role: ROLE.PROGRAMMATIC_READ },
        {
          type: mockEserviceFormSgUser1.type,
          role: mockEserviceFormSgUser1.role,
          emails: [mockEserviceWhitelistedUser1.email],
        },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest1, mockAgencyOnboardingApplicationTypeRequest2],
    },
    {
      name: mockEservice3.name,
      emails: mockEservice3.emails,
      users: [
        { type: mockProgrammaticWriteUser2.type, role: ROLE.PROGRAMMATIC_WRITE },
        { type: mockEserviceFormSgUser2.type, role: mockEserviceFormSgUser2.role, emails: [mockEserviceWhitelistedUser2.email] },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest2],
    },
  ],
  transactionTemplates: [mockTransactionTemplateOnboardingRequest1, mockTransactionTemplateOnboardingRequest2],
  notificationTemplates: [mockEmailNotificationTemplateOnboardingRequest, mockNotifyNotificationTemplateOnboardingRequest],
};

export const mockCreateEserviceResponse: Awaited<
  ReturnType<AgencyOnboardingService['createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates']>
> = {
  eservices: [mockEservice1, mockEservice2, mockEservice3],
  applicationTypes: [mockApplicationType1, mockApplicationType2],
  eserviceNameAgencyUsersMap: {
    [mockEservice1.name]: { programmaticUsers: [mockProgrammaticWriteUser1], eserviceUsers: [] },
    [mockEservice2.name]: { programmaticUsers: [mockProgrammaticReadUser1], eserviceUsers: [] },
    [mockEservice3.name]: { programmaticUsers: [mockProgrammaticWriteUser2], eserviceUsers: [] },
  },
  acknowledgementTemplates: [],
};

export const mockWithoutEserviceUserAgencyOnboardingRequest: AgencyOnboardingRequest = {
  agencyName: mockAgency.name,
  agencyCode: mockAgency.code,
  identityProofLocation: 'mockIdentityProofLocation',
  eservices: [
    {
      name: mockEservice1.name,
      emails: mockEservice1.emails,
      users: [
        { type: mockProgrammaticWriteUser1.type, role: ROLE.PROGRAMMATIC_WRITE },
        { type: mockProgrammaticReadUser1.type, role: ROLE.PROGRAMMATIC_READ },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest1],
    },
  ],
  transactionTemplates: [mockTransactionTemplateOnboardingRequest1, mockTransactionTemplateOnboardingRequest2],
  notificationTemplates: [mockEmailNotificationTemplateOnboardingRequest, mockNotifyNotificationTemplateOnboardingRequest],
};

// onboardNewEservices
export const mockEserviceOnboardingRequest: EserviceOnboardingRequest = {
  agencyCode: mockAgency.code,
  eservices: [
    {
      name: mockEservice1.name,
      emails: mockEservice1.emails,
      users: [
        { type: mockProgrammaticWriteUser1.type, role: ROLE.PROGRAMMATIC_WRITE },
        { type: mockProgrammaticReadUser1.type, role: ROLE.PROGRAMMATIC_READ },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest1],
    },
    {
      name: mockEservice2.name,
      emails: mockEservice2.emails,
      users: [
        { type: mockProgrammaticReadUser2.type, role: ROLE.PROGRAMMATIC_READ },
        {
          type: mockEserviceFormSgUser1.type,
          role: mockEserviceFormSgUser1.role,
          emails: [mockEserviceWhitelistedUser1.email],
        },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest1, mockAgencyOnboardingApplicationTypeRequest2],
    },
    {
      name: mockEservice3.name,
      emails: mockEservice3.emails,
      users: [
        { type: mockProgrammaticWriteUser2.type, role: ROLE.PROGRAMMATIC_WRITE },
        { type: mockEserviceFormSgUser2.type, role: mockEserviceFormSgUser2.role, emails: [mockEserviceWhitelistedUser2.email] },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest2],
    },
  ],
};

export const mockAgencyWithDuplicateEservice = createMockAgency({
  name: 'mockAgencyName',
  code: 'mockAgencyCode',
  eservices: [mockEservice1],
});

export const APPLICATION_TYPE_LTVP: AgencyOnboardingApplicationTypeRequest = {
  name: 'Long Term Visit Pass',
  code: 'LTVP',
  notificationChannels: [NOTIFICATION_CHANNEL.EMAIL],
};

export const APPLICATION_TYPE_STP: AgencyOnboardingApplicationTypeRequest = {
  name: 'Student Pass',
  code: 'STP',
  notificationChannels: [NOTIFICATION_CHANNEL.EMAIL],
};

export const ONBOARD_NEW_AGENCY_TEST_INPUT: AgencyOnboardingRequest = {
  agencyName: 'Immigration & Checkpoints Authority',
  agencyCode: 'ICA',
  identityProofLocation: 'ica.gov.sg',
  eservices: [
    {
      name: 'CIRIS',
      emails: ['filesgsqa+ciris@gmail.com'],

      users: [{ type: USER_TYPE.PROGRAMMATIC, role: ROLE.PROGRAMMATIC_WRITE }],
      applicationTypes: [APPLICATION_TYPE_LTVP],
    },
    {
      name: 'MyICA',
      emails: ['filesgsqa+myica@gmail.com'],

      users: [{ type: USER_TYPE.PROGRAMMATIC, role: ROLE.PROGRAMMATIC_READ }],
      applicationTypes: [APPLICATION_TYPE_LTVP, APPLICATION_TYPE_STP],
    },
    {
      name: 'APPLE',
      emails: ['filesgsqa+apple@gmail.com'],

      users: [{ type: USER_TYPE.PROGRAMMATIC, role: ROLE.PROGRAMMATIC_WRITE }],
      applicationTypes: [APPLICATION_TYPE_LTVP],
    },
  ],
  transactionTemplates: [],
  notificationTemplates: [],
};

export const ONBOARD_NEW_ESERVICE_TEST_INPUT: EserviceOnboardingRequest = {
  agencyCode: 'ICA',
  eservices: [
    {
      name: 'CIRIS',
      emails: ['filesgsqa+ciris@gmail.com'],

      users: [{ type: USER_TYPE.PROGRAMMATIC, role: ROLE.PROGRAMMATIC_WRITE }],
      applicationTypes: [APPLICATION_TYPE_LTVP],
    },
    {
      name: 'MyICA',
      emails: ['filesgsqa+myica@gmail.com'],

      users: [{ type: USER_TYPE.PROGRAMMATIC, role: ROLE.PROGRAMMATIC_READ }],
      applicationTypes: [APPLICATION_TYPE_LTVP, APPLICATION_TYPE_STP],
    },
  ],
};

export const TEST_INPUT_NON_DUPLICATED_APPLICATION_TYPE: AgencyOnboardingRequest = {
  agencyName: 'Immigration & Checkpoints Authority',
  agencyCode: 'ICA',
  identityProofLocation: 'ica.gov.sg',
  eservices: [
    {
      name: 'CIRIS',
      emails: ['filesgsqa+ciris@gmail.com'],

      users: [{ type: USER_TYPE.PROGRAMMATIC, role: ROLE.PROGRAMMATIC_READ }],
      applicationTypes: [APPLICATION_TYPE_LTVP],
    },
    {
      name: 'MyICA',
      emails: ['filesgsqa+myica@gmail.com'],

      users: [{ type: USER_TYPE.PROGRAMMATIC, role: ROLE.PROGRAMMATIC_READ }],
      applicationTypes: [APPLICATION_TYPE_STP],
    },
  ],
  transactionTemplates: [],
  notificationTemplates: [],
};

export const ONBOARD_TRANSACTION_TEMPLATE_TEST_INPUT: AddTransactionTemplatesRequest = {
  agencyCode: 'ICA',
  transactionTemplates: [
    { name: 'mock template 1', type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE, template: ['template string 1', 'template string 2'] },
  ],
};

export const ONBOARD_NOTIFICATION_TEMPLATE_TEST_INPUT: AddNotificationTemplatesRequest = {
  agencyCode: 'ICA',
  notificationTemplates: [
    {
      name: 'mock template 1',
      type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
      template: ['template string 1', 'template string 2'],
      notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
    },
  ],
};

export const mockEservice = createMockEservice({
  uuid: 'eservice-uuid-1',
  name: ONBOARD_NEW_ESERVICE_TEST_INPUT.eservices[0].name,
  emails: ONBOARD_NEW_ESERVICE_TEST_INPUT.eservices[0].emails,
});

export const mockWithoutEserviceUserEserviceOnboardingRequest: EserviceOnboardingRequest = {
  agencyCode: mockAgency.code,
  eservices: [
    {
      name: mockEservice1.name,
      emails: mockEservice1.emails,
      users: [
        { type: mockProgrammaticWriteUser1.type, role: ROLE.PROGRAMMATIC_WRITE },
        { type: mockProgrammaticReadUser1.type, role: ROLE.PROGRAMMATIC_READ },
      ],
      applicationTypes: [mockAgencyOnboardingApplicationTypeRequest1],
    },
  ],
};

// onboardNewAgencyUsers
export const mockAgencyUsersOnboardingRequest: AgencyUsersOnboardingRequest = {
  agencyCode: mockAgency.code,
  eserviceName: mockEservice1.name,
  users: [
    { type: mockProgrammaticWriteUser1.type, role: ROLE.PROGRAMMATIC_WRITE },
    { type: mockProgrammaticReadUser1.type, role: ROLE.PROGRAMMATIC_READ },
    {
      type: mockEserviceFormSgUser1.type,
      role: mockEserviceFormSgUser1.role,
      emails: [mockEserviceWhitelistedUser1.email],
    },
  ],
};

// onboardNewEserviceWhitelistedUsers
export const mockActiveEserviceWhitelistedUser1 = createMockEserviceWhitelistedUser({
  email: 'mockEmail1',
  status: STATUS.ACTIVE,
});

export const mockActiveEserviceWhitelistedUser2 = createMockEserviceWhitelistedUser({
  email: 'mockEmail2',
  status: STATUS.ACTIVE,
});

const mockFormAgency = createMockAgency({
  name: 'mockAgency',
  code: 'MOCK',
});

const mockFormEservice = createMockEservice({
  name: 'mockEservice',
  emails: ['mockEserviceEmail'],
  agency: mockFormAgency,
});

export const mockEserviceUserWithoutWhitelistedUsers = createMockEserviceUser({
  eservices: [mockFormEservice],
  status: STATUS.ACTIVE,
});

export const mockEserviceUserWithActiveWhitelistedUsers = createMockEserviceUser({
  eservices: [mockFormEservice],
  status: STATUS.ACTIVE,
  whitelistedUsers: [mockActiveEserviceWhitelistedUser1, mockActiveEserviceWhitelistedUser2],
});

export const mockEserviceWhitelistedUserOnboardingRequest: EserviceWhitelistedUsersOnboardingRequest = {
  agencyCode: mockFormAgency.code,
  eserviceName: mockFormEservice.name,
  emails: [mockActiveEserviceWhitelistedUser1.email, mockActiveEserviceWhitelistedUser2.email],
};

// inactivateNewEserviceWhitelistedUsers
export const mockInactiveEserviceWhitelistedUser = createMockEserviceWhitelistedUser({
  email: 'mockInactiveEmail1',
  status: STATUS.INACTIVE,
});

export const mockEserviceUserWithMissingWhitelistedUsers = createMockEserviceUser({
  eservices: [mockFormEservice],
  status: STATUS.ACTIVE,
  whitelistedUsers: [mockActiveEserviceWhitelistedUser1],
});

export const mockEserviceUserWithInactiveWhitelistedUsers = createMockEserviceUser({
  eservices: [mockFormEservice],
  status: STATUS.ACTIVE,
  whitelistedUsers: [mockActiveEserviceWhitelistedUser1, mockInactiveEserviceWhitelistedUser],
});

// =============================================================================
// Protected methods
// =============================================================================
// createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates
export const mockUserToEserviceInsertableInput: UserToEserviceInsertableInput[] = [
  {
    eservice: mockEservice1,
    users: [mockProgrammaticWriteUser1, mockProgrammaticReadUser1],
  },
  {
    eservice: mockEservice2,
    users: [mockProgrammaticReadUser2, mockEserviceFormSgUser1],
  },
  {
    eservice: mockEservice3,
    users: [mockProgrammaticWriteUser2, mockEserviceFormSgUser2],
  },
];

// createProgrammaticUsers
export const mockProgrammaticUserOnboardingRequestDetailsList: ProgrammaticUserOnboardingRequestDetails[] = [
  { type: mockProgrammaticWriteUser1.type, role: ROLE.PROGRAMMATIC_WRITE },
  { type: mockProgrammaticReadUser1.type, role: ROLE.PROGRAMMATIC_READ },
];

export const mockEserviceUserOnboardingRequestDetailsList: EserviceUserOnboardingRequestDetails[] = [
  {
    type: mockEserviceFormSgUser1.type,
    role: mockEserviceFormSgUser1.role,
    emails: [mockEserviceWhitelistedUser1.email],
  },
];

export const mockPlainClientSecretArray = [mockProgrammaticWriteUser1.clientSecret, mockProgrammaticReadUser1.clientSecret];

export const mockProgrammaticUserModels = [
  {
    role: ROLE.PROGRAMMATIC_WRITE,
    status: STATUS.ACTIVE,
    clientId: 'mockProgrammaticWriteUser1ClientId',
    clientSecret: 'mockProgrammaticWriteUser1ClientSecret',
  },
  {
    role: ROLE.PROGRAMMATIC_READ,
    status: STATUS.ACTIVE,
    clientId: 'mockProgrammaticReadUser1ClientId',
    clientSecret: 'mockProgrammaticReadUser1ClientSecret',
  },
];

// createEserviceUsers
export const mockDuplicateAgency = createMockAgency({
  name: 'mockAgencyName',
  code: 'mockAgencyCode',
});

export const mockDuplicateEservice = createMockEservice({
  name: 'mockEservice1',
  emails: ['mockEservice1Email1'],
  agency: mockDuplicateAgency,
});

export const mockDuplicateEserviceWhitelistedUser = createMockEserviceWhitelistedUser({
  email: 'mockEserviceWhitelistedUserEmail1',
  status: STATUS.ACTIVE,
});

export const mockDuplicateEserviceUser = createMockEserviceUser({
  role: ROLE.FORMSG,
  status: STATUS.ACTIVE,
  eservices: [mockDuplicateEservice],
  whitelistedUsers: [mockDuplicateEserviceWhitelistedUser],
});

// createAgencyUsers
export const mockAgencyUserOnboardingDetails: AgencyUserOnboardingDetails = [
  ...mockProgrammaticUserOnboardingRequestDetailsList,
  ...mockEserviceUserOnboardingRequestDetailsList,
];
