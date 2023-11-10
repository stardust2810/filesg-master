/* eslint-disable sonarjs/no-duplicate-string */
import { InputValidationException } from '@filesg/backend-common';
import {
  COMPONENT_ERROR_CODE,
  ContentType,
  EserviceAcknowledgementTemplateOnboardingRequest,
  EserviceUserOnboardingRequestDetails,
  INTEGRATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  ROLE,
  STATUS,
} from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  DuplicateEserviceWhitelistedUserException,
  InvalidEserviceWhitelistedUserEmailsException,
} from '../../../../common/filters/custom-exceptions.filter';
import {
  transformAgencyOnboardingResponse,
  transformAgencyUsersOnboardingResponse,
  transformEserviceOnboardingResponse,
} from '../../../../common/transformers/system.transformer';
import { FORMSG_TEMPLATE_INPUT_PARAGRAPH_FIELD_PREFIX, FORMSG_TEMPLATE_MAX_PARAGRAPH_COUNT } from '../../../../consts';
import { ApplicationType } from '../../../../entities/application-type';
import { AgencyUsers, ProgrammaticUserInput } from '../../../../typings/common';
import { verifyArgon2Hash } from '../../../../utils/encryption';
import { mockAcknowledgementTemplateEntityService } from '../../../entities/acknowledgement-template/__mocks__/acknowledgement-template.entity.service.mock';
import { AcknowledgementTemplateEntityService } from '../../../entities/acknowledgement-template/acknowledgement-template.entity.service';
import { mockAgencyEntityService } from '../../../entities/agency/__mocks__/agency.entity.service.mock';
import { AgencyEntityService } from '../../../entities/agency/agency.entity.service';
import { mockApplicationTypeEntityService } from '../../../entities/application-type/__mocks__/application-type.entity.service.mock';
import { ApplicationTypeEntityService } from '../../../entities/application-type/application-type.entity.service';
import { mockApplicationTypeNotificationEntityService } from '../../../entities/application-type-notification/__mocks__/application-type-notification.entity.service.mock';
import { ApplicationTypeNotificationEntityService } from '../../../entities/application-type-notification/application-type-notification.entity.service';
import { mockEserviceEntityService } from '../../../entities/eservice/__mocks__/eservice.entity.service.mock';
import { EserviceEntityService } from '../../../entities/eservice/eservice.entity.service';
import { mockEserviceWhitelistedUserEntityService } from '../../../entities/eservice-whitelisted-user/__mocks__/eservice-whitelisted-user.entity.service.mock';
import { EserviceWhitelistedUserEntityService } from '../../../entities/eservice-whitelisted-user/eservice-whitelisted-user.entity.service';
import { mockNotificationMessageTemplateUpdateRequest } from '../../../entities/notification-message-template/__mocks__/notification-message-template.entity.service.mock';
import { mockNotificationMessageTemplateEntityService } from '../../../entities/notification-message-template/__mocks__/notification-message-template.entity.service.mock';
import { NotificationMessageTemplateEntityService } from '../../../entities/notification-message-template/notification-message-template.entity.service';
import { mockNotificationMessageTemplateAuditEntityService } from '../../../entities/notification-message-template-audit/__mocks__/notification-message-template-audit.entity.service.mock';
import { NotificationMessageTemplateAuditEntityService } from '../../../entities/notification-message-template-audit/notification-message-template-audit.entity.service';
import { mockTransactionCustomMessageTemplateEntityService } from '../../../entities/transaction-custom-message-template/__mocks__/transaction-custom-message-template.entity.service.mock';
import { TransactionCustomMessageTemplateEntityService } from '../../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.service';
import { mockEserviceUserEntityService } from '../../../entities/user/__mocks__/eservice-user.entity.service.mock';
import { mockProgrammaticUserEntityService } from '../../../entities/user/__mocks__/programmatic-user.entity.service.mock';
import { EserviceUserEntityService } from '../../../entities/user/eservice-user.entity.service';
import { ProgrammaticUserEntityService } from '../../../entities/user/programmatic-user.entity.service';
import { mockDatabaseTransaction, mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import {
  APPLICATION_TYPE_LTVP,
  APPLICATION_TYPE_STP,
  mockAcknowledgemenTemplate,
  mockActiveEserviceWhitelistedUser1,
  mockActiveEserviceWhitelistedUser2,
  mockAgency,
  mockAgencyOnboardingRequest,
  mockAgencyUserOnboardingDetails,
  mockAgencyUsersOnboardingRequest,
  mockAgencyWithDuplicateEservice,
  mockCreateEserviceResponse,
  mockDuplicateEserviceUser,
  mockEmailNotificationMessageTemplate,
  mockEservice1,
  mockEservice2,
  mockEservice3,
  mockEserviceFormSgUser1,
  mockEserviceFormSgUser2,
  mockEserviceOnboardingRequest,
  mockEserviceUserOnboardingRequestDetailsList,
  mockEserviceUserWithActiveWhitelistedUsers,
  mockEserviceUserWithInactiveWhitelistedUsers,
  mockEserviceUserWithMissingWhitelistedUsers,
  mockEserviceUserWithoutWhitelistedUsers,
  mockEserviceWhitelistedUser1,
  mockEserviceWhitelistedUserOnboardingRequest,
  mockNotifyNotificationMessageTemplate,
  mockPlainClientSecretArray,
  mockProgrammaticReadUser1,
  mockProgrammaticReadUser2,
  mockProgrammaticUserModels,
  mockProgrammaticUserOnboardingRequestDetailsList,
  mockProgrammaticWriteUser1,
  mockProgrammaticWriteUser2,
  mockTransactionCustomMessageTemplate1,
  mockTransactionCustomMessageTemplate2,
  mockUserToEserviceInsertableInput,
  mockWithoutEserviceUserAgencyOnboardingRequest,
  mockWithoutEserviceUserEserviceOnboardingRequest,
  ONBOARD_NEW_AGENCY_TEST_INPUT,
  ONBOARD_NEW_ESERVICE_TEST_INPUT,
  ONBOARD_NOTIFICATION_TEMPLATE_TEST_INPUT,
  ONBOARD_TRANSACTION_TEMPLATE_TEST_INPUT,
  TestAgencyOnboardingService,
} from '../__mocks__/agency-onboarding.service.mock';

describe('AgencyOnboardingService', () => {
  let agencyOnboardingService: TestAgencyOnboardingService;
  const { entityManager } = mockDatabaseTransaction;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TestAgencyOnboardingService, useClass: TestAgencyOnboardingService },
        { provide: ProgrammaticUserEntityService, useValue: mockProgrammaticUserEntityService },
        { provide: EserviceUserEntityService, useValue: mockEserviceUserEntityService },
        { provide: EserviceWhitelistedUserEntityService, useValue: mockEserviceWhitelistedUserEntityService },
        { provide: AgencyEntityService, useValue: mockAgencyEntityService },
        { provide: EserviceEntityService, useValue: mockEserviceEntityService },
        { provide: ApplicationTypeEntityService, useValue: mockApplicationTypeEntityService },
        { provide: ApplicationTypeNotificationEntityService, useValue: mockApplicationTypeNotificationEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: AcknowledgementTemplateEntityService, useValue: mockAcknowledgementTemplateEntityService },
        { provide: NotificationMessageTemplateEntityService, useValue: mockNotificationMessageTemplateEntityService },
        { provide: NotificationMessageTemplateAuditEntityService, useValue: mockNotificationMessageTemplateAuditEntityService },
        { provide: TransactionCustomMessageTemplateEntityService, useValue: mockTransactionCustomMessageTemplateEntityService },
      ],
    }).compile();

    agencyOnboardingService = module.get<TestAgencyOnboardingService>(TestAgencyOnboardingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('agencyOnboardingService be defined', () => {
    expect(agencyOnboardingService).toBeDefined();
  });

  describe('Public Methods', () => {
    afterAll(() => {
      // To restore all spies on protected methods
      jest.restoreAllMocks();
    });
    // =========================================================================
    // Public methods
    // =========================================================================
    describe('onboardNewAgency', () => {
      const mockEncryptionKey = 'mockEncryptionKey';
      const mockWalletAddress = 'mockWalletAddress';

      let createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy: jest.SpyInstance;
      let createTransactionCustomMessageTemplatesSpy: jest.SpyInstance;
      let createNotificationMessageTemplatesSpy: jest.SpyInstance;
      let createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy: jest.SpyInstance;

      beforeAll(() => {
        const oaEncryptionLib = require('@govtechsg/oa-encryption');
        const ethersLib = require('ethers');
        const generateEncryptionKeySpy = jest.spyOn(oaEncryptionLib, 'generateEncryptionKey');
        const walletSpy = jest.spyOn(ethersLib, 'Wallet');
        createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy = jest.spyOn(
          agencyOnboardingService,
          'createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates',
        );
        createTransactionCustomMessageTemplatesSpy = jest.spyOn(agencyOnboardingService, 'createTransactionCustomMessageTemplates');
        createNotificationMessageTemplatesSpy = jest.spyOn(agencyOnboardingService, 'createNotificationMessageTemplates');
        createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy = jest.spyOn(
          agencyOnboardingService,
          'createFormSgIssuanceAgencyTransactionAndNotificationTemplates',
        );

        mockAgencyEntityService.isAgencyExistsByCode.mockResolvedValue(false);
        generateEncryptionKeySpy.mockReturnValue(mockEncryptionKey);
        walletSpy.mockReturnValue({
          address: mockWalletAddress,
        });
        createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy.mockResolvedValue(mockCreateEserviceResponse);
        mockAgencyEntityService.saveAgency.mockResolvedValue(mockAgency);
        createTransactionCustomMessageTemplatesSpy.mockResolvedValue([
          mockTransactionCustomMessageTemplate1,
          mockTransactionCustomMessageTemplate2,
        ]);
        createNotificationMessageTemplatesSpy.mockResolvedValue([
          mockEmailNotificationMessageTemplate,
          mockNotifyNotificationMessageTemplate,
        ]);
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.onboardNewAgency).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        // Spies
        const createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy = jest.spyOn(
          agencyOnboardingService,
          'createFormSgIssuanceAgencyTransactionAndNotificationTemplates',
        );

        // Mock values
        const { agencyName, agencyCode, identityProofLocation, transactionTemplates, notificationTemplates } = mockAgencyOnboardingRequest;

        // Execute method
        await agencyOnboardingService.onboardNewAgency(mockAgencyOnboardingRequest);

        // Tests
        expect(mockAgencyEntityService.isAgencyExistsByCode).toBeCalledWith(agencyCode);
        expect(mockAgencyEntityService.saveAgency).toBeCalledWith(
          { code: agencyCode.trim(), name: agencyName, oaSigningKey: `0x${mockEncryptionKey}`, identityProofLocation },
          entityManager,
        );
        expect(createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy).toBeCalledWith(
          mockAgency,
          mockAgencyOnboardingRequest,
          entityManager,
        );
        expect(createTransactionCustomMessageTemplatesSpy).toBeCalledWith(transactionTemplates, mockAgency, entityManager);
        expect(createNotificationMessageTemplatesSpy).toBeCalledWith(notificationTemplates, mockAgency, entityManager);
        expect(createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy).toBeCalledWith(
          mockAgency,
          true,
          [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.SG_NOTIFY],
          entityManager,
        );
      });

      it('should return the correct values', async () => {
        const { eservices, applicationTypes, eserviceNameAgencyUsersMap, acknowledgementTemplates } = mockCreateEserviceResponse;

        const mockResponse = transformAgencyOnboardingResponse(
          mockAgencyOnboardingRequest,
          mockAgency,
          eservices,
          applicationTypes,
          eserviceNameAgencyUsersMap,
          acknowledgementTemplates,
          [mockTransactionCustomMessageTemplate1, mockTransactionCustomMessageTemplate2],
          [mockEmailNotificationMessageTemplate, mockNotifyNotificationMessageTemplate],
          mockWalletAddress,
        );

        expect(await agencyOnboardingService.onboardNewAgency(mockAgencyOnboardingRequest)).toEqual(mockResponse);
      });

      it('should throw InputValidationException if agency already exists', async () => {
        mockAgencyEntityService.isAgencyExistsByCode.mockResolvedValueOnce(true);

        await expect(agencyOnboardingService.onboardNewAgency(mockAgencyOnboardingRequest)).rejects.toThrowError(InputValidationException);
      });

      it('should not create formsg templates if no eservice user is provided', async () => {
        await agencyOnboardingService.onboardNewAgency(mockWithoutEserviceUserAgencyOnboardingRequest);

        expect(createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy).not.toBeCalled();
      });
    });

    describe('onboardNewEservices', () => {
      const mockEncryptionKey = 'mockEncryptionKey';
      const mockWalletAddress = 'mockWalletAddress';

      let createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy: jest.SpyInstance;
      let createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy: jest.SpyInstance;

      beforeAll(() => {
        const oaEncryptionLib = require('@govtechsg/oa-encryption');
        const ethersLib = require('ethers');
        const generateEncryptionKeySpy = jest.spyOn(oaEncryptionLib, 'generateEncryptionKey');
        const walletSpy = jest.spyOn(ethersLib, 'Wallet');
        createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy = jest.spyOn(
          agencyOnboardingService,
          'createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates',
        );
        createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy = jest.spyOn(
          agencyOnboardingService,
          'createFormSgIssuanceAgencyTransactionAndNotificationTemplates',
        );

        mockAgencyEntityService.retrieveAgencyWithEservicesByCode.mockResolvedValue(mockAgency);
        generateEncryptionKeySpy.mockReturnValue(mockEncryptionKey);
        walletSpy.mockReturnValue({
          address: mockWalletAddress,
        });
        createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy.mockResolvedValue(mockCreateEserviceResponse);
        mockAgencyEntityService.retrieveAgencyByIdWithFormSgTransactionAndNotificationTemplates.mockResolvedValue({
          notificationMessageTemplates: [],
          transactionCustomMessageTemplates: [],
        });
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.onboardNewEservices).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        // Execute method
        await agencyOnboardingService.onboardNewEservices(mockEserviceOnboardingRequest);

        // Tests
        expect(mockAgencyEntityService.retrieveAgencyWithEservicesByCode).toBeCalledWith(mockEserviceOnboardingRequest.agencyCode);
        expect(createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplatesSpy).toBeCalledWith(
          mockAgency,
          mockEserviceOnboardingRequest,
          entityManager,
        );
        expect(mockAgencyEntityService.retrieveAgencyByIdWithFormSgTransactionAndNotificationTemplates);
        expect(createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy).toBeCalledWith(
          mockAgency,
          true,
          [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.SG_NOTIFY],
          entityManager,
        );
      });

      it('should return the correct values', async () => {
        const { eservices, applicationTypes, eserviceNameAgencyUsersMap, acknowledgementTemplates } = mockCreateEserviceResponse;

        const mockResponse = transformEserviceOnboardingResponse(
          mockEserviceOnboardingRequest,
          mockAgency,
          eservices,
          applicationTypes,
          eserviceNameAgencyUsersMap,
          acknowledgementTemplates,
        );

        expect(await agencyOnboardingService.onboardNewEservices(mockEserviceOnboardingRequest)).toEqual(mockResponse);
      });

      it('should throw InputValidationException if there is no existing agency', async () => {
        mockAgencyEntityService.retrieveAgencyWithEservicesByCode.mockResolvedValueOnce(undefined);

        await expect(agencyOnboardingService.onboardNewEservices(mockEserviceOnboardingRequest)).rejects.toThrowError(
          new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, 'Agency does not exist'),
        );
      });

      it('should throw InputValidationException if there is duplicated eservices between request input and agency', async () => {
        mockAgencyEntityService.retrieveAgencyWithEservicesByCode.mockResolvedValueOnce(mockAgencyWithDuplicateEservice);

        await expect(agencyOnboardingService.onboardNewEservices(mockEserviceOnboardingRequest)).rejects.toThrowError(
          InputValidationException,
        );
      });

      it('should not create formsg templates if no eservice user is provided', async () => {
        await agencyOnboardingService.onboardNewEservices(mockWithoutEserviceUserEserviceOnboardingRequest);

        expect(createFormSgIssuanceAgencyTransactionAndNotificationTemplatesSpy).not.toBeCalled();
      });
    });

    describe('onboardNewEserviceAcknowledgementTemplate', () => {
      it('should throw InputValidationException if there is no existing agency', async () => {
        mockAgencyEntityService.retrieveAgencyWithEservicesByCode.mockResolvedValueOnce(undefined);

        await expect(agencyOnboardingService.onboardNewEservices(ONBOARD_NEW_ESERVICE_TEST_INPUT)).rejects.toThrowError(
          InputValidationException,
        );
      });

      it('should throw InputValidationException if there is unknown eservices between request input and agency', async () => {
        const inputWithUnknownEservice: EserviceAcknowledgementTemplateOnboardingRequest = {
          agencyCode: 'ICA',
          eservices: [
            {
              name: 'Unknown',
              acknowledgementTemplates: [
                {
                  name: 'simple template',
                  content: [
                    {
                      contentType: ContentType.ORDERED,
                      content: ['test'],
                    },
                  ],
                },
              ],
            },
          ],
        };

        mockAgencyEntityService.isAgencyExistsByCode.mockResolvedValueOnce(true);
        mockAgencyEntityService.retrieveAgencyWithEservicesByCode.mockResolvedValueOnce(mockAgency);

        await expect(agencyOnboardingService.onboardNewEserviceAcknowledgementTemplate(inputWithUnknownEservice)).rejects.toThrowError(
          InputValidationException,
        );
      });
    });

    describe('onboardNewTransactionCustomMessageTemplate', () => {
      it('should throw InputValidationException if there is no existing agency', async () => {
        mockAgencyEntityService.isAgencyExistsByCode.mockResolvedValueOnce(false);

        await expect(
          agencyOnboardingService.onboardNewTransactionCustomMessageTemplate(ONBOARD_TRANSACTION_TEMPLATE_TEST_INPUT),
        ).rejects.toThrowError(InputValidationException);
      });
    });

    describe('updateTransactionCustomMessageTemplate', () => {
      //TODO: implement test
    });

    describe('onboardNewNotificationMessageTemplate', () => {
      it('should throw InputValidationException if there is no existing agency', async () => {
        mockAgencyEntityService.isAgencyExistsByCode.mockResolvedValueOnce(false);

        await expect(
          agencyOnboardingService.onboardNewNotificationMessageTemplate(ONBOARD_NOTIFICATION_TEMPLATE_TEST_INPUT),
        ).rejects.toThrowError(InputValidationException);
      });
    });

    describe('onboardNotificationMessageTemplateUpdate', () => {
      //TODO: implement test
    });

    describe('updateNotificationMessageTemplate', () => {
      //TODO: implement test
    });

    describe('onboardNewAgencyUsers', () => {
      let createAgencyUsersSpy: jest.SpyInstance;
      let associateUsersToEserviceSpy: jest.SpyInstance;

      beforeAll(() => {
        createAgencyUsersSpy = jest.spyOn(agencyOnboardingService, 'createAgencyUsers');
        associateUsersToEserviceSpy = jest.spyOn(agencyOnboardingService, 'associateUsersToEservice');

        mockEserviceEntityService.retrieveEserviceByAgencyCodeAndEserviceName.mockResolvedValue(mockEservice1);
        createAgencyUsersSpy.mockResolvedValue({
          programmaticUsers: [mockProgrammaticWriteUser1, mockProgrammaticReadUser1],
          eserviceUsers: [mockEserviceFormSgUser1],
        });
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.onboardNewAgencyUsers).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        await agencyOnboardingService.onboardNewAgencyUsers(mockAgencyUsersOnboardingRequest);

        expect(createAgencyUsersSpy).toBeCalledWith(mockAgencyUsersOnboardingRequest.users, entityManager);
        expect(associateUsersToEserviceSpy).toBeCalledWith(
          [
            {
              eservice: mockEservice1,
              users: [mockProgrammaticWriteUser1, mockProgrammaticReadUser1, mockEserviceFormSgUser1],
            },
          ],
          entityManager,
        );
      });

      it('should return the correct values', async () => {
        expect(await agencyOnboardingService.onboardNewAgencyUsers(mockAgencyUsersOnboardingRequest)).toEqual(
          transformAgencyUsersOnboardingResponse([mockProgrammaticWriteUser1, mockProgrammaticReadUser1], [mockEserviceFormSgUser1]),
        );
      });
    });

    describe('onboardNewEserviceWhitelistedUsers', () => {
      it('should be defined', () => {
        expect(agencyOnboardingService.onboardNewEserviceWhitelistedUsers).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        const { agencyCode, eserviceName, emails } = mockEserviceWhitelistedUserOnboardingRequest;

        mockEserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName.mockResolvedValueOnce(
          mockEserviceUserWithoutWhitelistedUsers,
        );
        mockEserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails.mockResolvedValueOnce([]);

        await agencyOnboardingService.onboardNewEserviceWhitelistedUsers(mockEserviceWhitelistedUserOnboardingRequest);

        expect(mockEserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName).toBeCalledWith(
          agencyCode,
          eserviceName,
        );
        expect(mockEserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails).toBeCalledWith(emails);
        expect(mockEserviceWhitelistedUserEntityService.insertEserviceWhitelistedUsers).toBeCalledWith([
          {
            email: mockActiveEserviceWhitelistedUser1.email,
            eserviceUser: mockEserviceUserWithoutWhitelistedUsers,
            status: STATUS.ACTIVE,
          },
          {
            email: mockActiveEserviceWhitelistedUser2.email,
            eserviceUser: mockEserviceUserWithoutWhitelistedUsers,
            status: STATUS.ACTIVE,
          },
        ]);
      });

      it('should throw DuplicateEserviceWhitelistedUserException if emails provided already exist', async () => {
        mockEserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName.mockResolvedValueOnce(
          mockEserviceUserWithActiveWhitelistedUsers,
        );
        mockEserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails.mockResolvedValueOnce([
          mockEserviceUserWithActiveWhitelistedUsers,
        ]);

        await expect(
          agencyOnboardingService.onboardNewEserviceWhitelistedUsers(mockEserviceWhitelistedUserOnboardingRequest),
        ).rejects.toThrowError(DuplicateEserviceWhitelistedUserException);
      });
    });

    describe('inactivateNewEserviceWhitelistedUsers', () => {
      it('should be defined', () => {
        expect(agencyOnboardingService.inactivateNewEserviceWhitelistedUsers).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        const { agencyCode, eserviceName, emails } = mockEserviceWhitelistedUserOnboardingRequest;

        mockEserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName.mockResolvedValueOnce(
          mockEserviceUserWithActiveWhitelistedUsers,
        );

        await agencyOnboardingService.inactivateNewEserviceWhitelistedUsers(mockEserviceWhitelistedUserOnboardingRequest);

        expect(mockEserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName).toBeCalledWith(
          agencyCode,
          eserviceName,
        );
        expect(mockEserviceWhitelistedUserEntityService.updateEserviceWhitelistedUsersByEmails).toBeCalledWith(emails, {
          status: STATUS.INACTIVE,
        });
      });

      it('should throw InvalidEserviceWhitelistedUserEmailsException if emails provided do not exist', async () => {
        mockEserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName.mockResolvedValueOnce(
          mockEserviceUserWithMissingWhitelistedUsers,
        );

        await expect(
          agencyOnboardingService.inactivateNewEserviceWhitelistedUsers(mockEserviceWhitelistedUserOnboardingRequest),
        ).rejects.toThrowError(InvalidEserviceWhitelistedUserEmailsException);
      });

      it('should throw InvalidEserviceWhitelistedUserEmailsException if emails provided are inactive', async () => {
        mockEserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName.mockResolvedValueOnce(
          mockEserviceUserWithInactiveWhitelistedUsers,
        );

        await expect(
          agencyOnboardingService.inactivateNewEserviceWhitelistedUsers(mockEserviceWhitelistedUserOnboardingRequest),
        ).rejects.toThrowError(InvalidEserviceWhitelistedUserEmailsException);
      });
    });

    // =========================================================================
    // Protected Methods
    // =========================================================================
  });

  describe('Protected Methods', () => {
    describe('createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates', () => {
      let createAndSaveEservicesWithCascadeEntitiesSpy: jest.SpyInstance;
      let createAgencyUsersSpy: jest.SpyInstance;
      let associateUsersToEserviceSpy: jest.SpyInstance;
      let createAcknowledgementTemplatesSpy: jest.SpyInstance;

      beforeAll(() => {
        createAndSaveEservicesWithCascadeEntitiesSpy = jest.spyOn(agencyOnboardingService, 'createAndSaveEservicesWithCascadeEntities');
        associateUsersToEserviceSpy = jest.spyOn(agencyOnboardingService, 'associateUsersToEservice');
        createAcknowledgementTemplatesSpy = jest.spyOn(agencyOnboardingService, 'createAcknowledgementTemplates');

        createAndSaveEservicesWithCascadeEntitiesSpy.mockResolvedValue([mockEservice1, mockEservice2, mockEservice3]);
        createAcknowledgementTemplatesSpy.mockResolvedValue([mockAcknowledgemenTemplate]);
      });

      beforeEach(() => {
        createAgencyUsersSpy = jest.spyOn(agencyOnboardingService, 'createAgencyUsers');

        //FIXME: find a way to perma mock
        createAgencyUsersSpy
          .mockResolvedValueOnce({
            programmaticUsers: [mockProgrammaticWriteUser1, mockProgrammaticReadUser1],
            eserviceUsers: [],
          })
          .mockResolvedValueOnce({
            programmaticUsers: [mockProgrammaticReadUser2],
            eserviceUsers: [mockEserviceFormSgUser1],
          })
          .mockResolvedValueOnce({
            programmaticUsers: [mockProgrammaticWriteUser2],
            eserviceUsers: [mockEserviceFormSgUser2],
          });
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        const { eservices: mockInputEservices } = mockAgencyOnboardingRequest;

        await agencyOnboardingService.createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates(
          mockAgency,
          mockAgencyOnboardingRequest,
          entityManager,
        );

        expect(createAndSaveEservicesWithCascadeEntitiesSpy).toBeCalledWith(mockAgency.id, mockInputEservices, entityManager);
        expect(createAgencyUsersSpy).nthCalledWith(1, mockInputEservices[0].users, entityManager);
        expect(createAgencyUsersSpy).nthCalledWith(2, mockInputEservices[1].users, entityManager);
        expect(createAgencyUsersSpy).nthCalledWith(3, mockInputEservices[2].users, entityManager);
        expect(associateUsersToEserviceSpy).toBeCalledWith(mockUserToEserviceInsertableInput, entityManager);
      });

      it('should return the correct values', async () => {
        const mockEservices = [mockEservice1, mockEservice2, mockEservice3];
        const mockApplicationTypes = mockEservices.reduce<ApplicationType[]>((applicationTypes, eservice) => {
          if (eservice.applicationTypes) {
            applicationTypes.push(...eservice.applicationTypes);
          }

          return applicationTypes;
        }, []);

        const mockEserviceNameAgencyUsersMap: Record<string, AgencyUsers> = {
          [mockEservice1.name]: {
            programmaticUsers: [mockProgrammaticWriteUser1, mockProgrammaticReadUser1],
            eserviceUsers: [],
          },
          [mockEservice2.name]: {
            programmaticUsers: [mockProgrammaticReadUser2],
            eserviceUsers: [mockEserviceFormSgUser1],
          },
          [mockEservice3.name]: {
            programmaticUsers: [mockProgrammaticWriteUser2],
            eserviceUsers: [mockEserviceFormSgUser2],
          },
        };

        expect(
          await agencyOnboardingService.createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates(
            mockAgency,
            mockAgencyOnboardingRequest,
            entityManager,
          ),
        ).toEqual({
          eservices: mockEservices,
          applicationTypes: mockApplicationTypes,
          eserviceNameAgencyUsersMap: mockEserviceNameAgencyUsersMap,
          acknowledgementTemplates: [mockAcknowledgemenTemplate],
        });
      });
    });

    describe('createAndSaveEservicesWithCascadeEntities', () => {
      it('should be defined', () => {
        expect(agencyOnboardingService.createAndSaveEservicesWithCascadeEntities).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        //TODO: implement test
      });
    });

    describe('generateEserviceAndCascadeEntitiesInsertables', () => {
      it('eservices insertables should be generated correctly', () => {
        mockApplicationTypeEntityService.buildApplicationType.mockImplementation((data) => data);
        expect(agencyOnboardingService.generateEserviceAndCascadeEntitiesInsertables(1, ONBOARD_NEW_AGENCY_TEST_INPUT.eservices)).toEqual([
          {
            name: 'CIRIS',
            emails: ['filesgsqa+ciris@gmail.com'],
            agencyId: 1,
            applicationTypes: [{ ...APPLICATION_TYPE_LTVP, applicationTypeNotifications: [] }],
          },
          {
            name: 'MyICA',
            emails: ['filesgsqa+myica@gmail.com'],
            agencyId: 1,
            applicationTypes: [
              { ...APPLICATION_TYPE_LTVP, applicationTypeNotifications: [] },
              { ...APPLICATION_TYPE_STP, applicationTypeNotifications: [] },
            ],
          },
          {
            name: 'APPLE',
            emails: ['filesgsqa+apple@gmail.com'],
            agencyId: 1,
            applicationTypes: [{ ...APPLICATION_TYPE_LTVP, applicationTypeNotifications: [] }],
          },
        ]);
      });
    });

    describe('createProgrammaticUsers', () => {
      let generateProgrammaticUserInsertablesSpy: jest.SpyInstance;

      beforeAll(() => {
        generateProgrammaticUserInsertablesSpy = jest.spyOn(agencyOnboardingService, 'generateProgrammaticUserInsertables');

        generateProgrammaticUserInsertablesSpy.mockResolvedValue([mockPlainClientSecretArray, mockProgrammaticUserModels]);
        mockProgrammaticUserEntityService.saveProgrammaticUsers.mockResolvedValue([mockProgrammaticWriteUser1, mockProgrammaticReadUser1]);
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.createProgrammaticUsers).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        await agencyOnboardingService.createProgrammaticUsers(mockProgrammaticUserOnboardingRequestDetailsList, entityManager);

        expect(generateProgrammaticUserInsertablesSpy).toBeCalledWith(mockProgrammaticUserOnboardingRequestDetailsList);
        expect(mockProgrammaticUserEntityService.saveProgrammaticUsers).toBeCalledWith(mockProgrammaticUserModels, entityManager);
      });

      it('should return the correct values', async () => {
        expect(
          await agencyOnboardingService.createProgrammaticUsers(mockProgrammaticUserOnboardingRequestDetailsList, entityManager),
        ).toEqual([mockProgrammaticWriteUser1, mockProgrammaticReadUser1]);
      });
    });

    describe('createEserviceUsers', () => {
      let generateEserviceUserInsertablesSpy: jest.SpyInstance;

      beforeAll(() => {
        generateEserviceUserInsertablesSpy = jest.spyOn(agencyOnboardingService, 'generateEserviceUserInsertables');

        mockEserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails.mockResolvedValue([]);
        generateEserviceUserInsertablesSpy.mockReturnValue([
          {
            role: ROLE.FORMSG,
            status: STATUS.ACTIVE,
          },
        ]);
        mockEserviceUserEntityService.saveEserviceUsers.mockResolvedValue([mockEserviceFormSgUser1]);
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.createEserviceUsers).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        await agencyOnboardingService.createEserviceUsers(mockEserviceUserOnboardingRequestDetailsList, entityManager);

        expect(mockEserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails).toBeCalledWith([
          mockEserviceWhitelistedUser1.email,
        ]);
        expect(generateEserviceUserInsertablesSpy).toBeCalledWith(mockEserviceUserOnboardingRequestDetailsList);
      });

      it('should return the correct values', async () => {
        expect(await agencyOnboardingService.createEserviceUsers(mockEserviceUserOnboardingRequestDetailsList, entityManager)).toEqual([
          mockEserviceFormSgUser1,
        ]);
      });

      it('should throw DuplicateEserviceWhitelistedUserException if any eservice users are found with the provided email', async () => {
        mockEserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails.mockResolvedValueOnce([
          mockDuplicateEserviceUser,
        ]);

        await expect(
          agencyOnboardingService.createEserviceUsers(mockEserviceUserOnboardingRequestDetailsList, entityManager),
        ).rejects.toThrowError(DuplicateEserviceWhitelistedUserException);
      });
    });

    describe('createAgencyUsers', () => {
      let createProgrammaticUsersSpy: jest.SpyInstance;
      let createEserviceUsersSpy: jest.SpyInstance;

      beforeAll(() => {
        createProgrammaticUsersSpy = jest.spyOn(agencyOnboardingService, 'createProgrammaticUsers');
        createEserviceUsersSpy = jest.spyOn(agencyOnboardingService, 'createEserviceUsers');

        createProgrammaticUsersSpy.mockResolvedValue([mockProgrammaticWriteUser1, mockProgrammaticReadUser1]);
        createEserviceUsersSpy.mockResolvedValue([mockEserviceFormSgUser1]);
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.createAgencyUsers).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        await agencyOnboardingService.createAgencyUsers(mockAgencyUserOnboardingDetails, entityManager);

        expect(createProgrammaticUsersSpy).toBeCalledWith(
          [{ role: ROLE.PROGRAMMATIC_WRITE }, { role: ROLE.PROGRAMMATIC_READ }],
          entityManager,
        );
        expect(createEserviceUsersSpy).toBeCalledWith(
          [{ role: ROLE.FORMSG, emails: (mockAgencyUserOnboardingDetails[2] as EserviceUserOnboardingRequestDetails).emails }],
          entityManager,
        );
      });

      it('should return the correct values', async () => {
        expect(await agencyOnboardingService.createAgencyUsers(mockAgencyUserOnboardingDetails, entityManager)).toEqual({
          programmaticUsers: [mockProgrammaticWriteUser1, mockProgrammaticReadUser1],
          eserviceUsers: [mockEserviceFormSgUser1],
        });
      });

      it('should not call createProgrammaticUsers if no ProgrammaticUserOnboardingRequestDetails provided', async () => {
        await agencyOnboardingService.createAgencyUsers(mockEserviceUserOnboardingRequestDetailsList, entityManager);

        expect(createProgrammaticUsersSpy).toBeCalledTimes(0);
      });

      it('should not call createProgrammaticUsers no ProgrammaticUserOnboardingRequestDetails provided', async () => {
        await agencyOnboardingService.createAgencyUsers(mockProgrammaticUserOnboardingRequestDetailsList, entityManager);

        expect(createEserviceUsersSpy).toBeCalledTimes(0);
      });
    });

    describe('createAcknowledgementTemplates', () => {
      //TODO: implement test
    });

    describe('createTransactionCustomMessageTemplates', () => {
      //TODO: implement test
    });

    describe('createNotificationMessageTemplates', () => {
      //TODO: implement test
    });

    describe('updateNotificationMessageTemplateAndCreateAudit', () => {
      it('should return error without existing notification message template found', () => {
        expect(
          agencyOnboardingService.updateNotificationMessageTemplateAndCreateAudit(mockNotificationMessageTemplateUpdateRequest),
        ).rejects.toThrowError();
      });
    });

    describe('createFormSgIssuanceAgencyTransactionAndNotificationTemplates', () => {
      let createTransactionCustomMessageTemplatesSpy: jest.SpyInstance;
      let createNotificationMessageTemplatesSpy: jest.SpyInstance;

      const defaultTemplate = Array.from(
        { length: FORMSG_TEMPLATE_MAX_PARAGRAPH_COUNT },
        (_, index) => `{{${FORMSG_TEMPLATE_INPUT_PARAGRAPH_FIELD_PREFIX}${index + 1}}}`,
      );

      beforeAll(() => {
        createTransactionCustomMessageTemplatesSpy = jest.spyOn(agencyOnboardingService, 'createTransactionCustomMessageTemplates');
        createNotificationMessageTemplatesSpy = jest.spyOn(agencyOnboardingService, 'createNotificationMessageTemplates');
      });

      it('should be defined', () => {
        expect(agencyOnboardingService.createFormSgIssuanceAgencyTransactionAndNotificationTemplates).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        await agencyOnboardingService.createFormSgIssuanceAgencyTransactionAndNotificationTemplates(
          mockAgency,
          true,
          [NOTIFICATION_CHANNEL.EMAIL],
          entityManager,
        );

        expect(createTransactionCustomMessageTemplatesSpy).toBeCalledWith(
          [
            {
              name: `${mockAgency.code}-formsg-transaction`,
              type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
              template: defaultTemplate,
              integrationType: INTEGRATION_TYPE.FORMSG,
            },
          ],
          mockAgency,
          entityManager,
        );
        expect(createNotificationMessageTemplatesSpy).toBeCalledWith(
          [
            {
              notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
              name: `${mockAgency.code}-formsg-${NOTIFICATION_CHANNEL.EMAIL}`,
              type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
              template: defaultTemplate,
              integrationType: INTEGRATION_TYPE.FORMSG,
            },
          ],
          mockAgency,
          entityManager,
        );
      });
    });

    describe('generateProgrammaticUserInsertables', () => {
      it('programmaticUser insertables should be generated correctly', async () => {
        const [plainClientSecrets, insertables] = await agencyOnboardingService.generateProgrammaticUserInsertables(
          ONBOARD_NEW_AGENCY_TEST_INPUT.eservices[0].users as ProgrammaticUserInput[],
        );
        // need to test without client id and secret as they are auto generated
        const insertablesWithoutClientIdAndSecret = insertables.map(({ role, status }) => ({
          role,
          status,
        }));

        expect(insertablesWithoutClientIdAndSecret).toEqual([
          {
            role: ROLE.PROGRAMMATIC_WRITE,
            status: STATUS.ACTIVE,
          },
        ]);

        // 1 programmatic user will have 1 plain client secret
        expect(insertables.length).toEqual(plainClientSecrets.length);

        // To ensure that the plainClientSecret equal is the same as hashed value
        insertables.forEach(async ({ clientSecret }, index) => {
          await expect(verifyArgon2Hash(clientSecret, plainClientSecrets[index])).resolves.toEqual(true);
        });
      });
    });

    describe('generateEserviceUserInsertables', () => {
      it('should be defined', () => {
        expect(agencyOnboardingService.generateEserviceUserInsertables).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        //TODO: implement test
      });

      it('should return the correct values', async () => {
        //TODO: implement test
      });
    });

    describe('associateUsersToEservice', () => {
      it('should be defined', () => {
        expect(agencyOnboardingService.associateUsersToEservice).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        //TODO: implement test
      });

      it('should return the correct values', async () => {
        //TODO: implement test
      });
    });

    describe('generateEserviceToUserInsertables', () => {
      it('should be defined', () => {
        expect(agencyOnboardingService.generateEserviceToUserInsertables).toBeDefined();
      });

      it('should call methods with correct args', async () => {
        //TODO: implement test
      });

      it('should return the correct values', async () => {
        //TODO: implement test
      });
    });

    describe('extractDynamicFieldsFromTemplate', () => {
      //TODO: implement test
    });
  });
});
