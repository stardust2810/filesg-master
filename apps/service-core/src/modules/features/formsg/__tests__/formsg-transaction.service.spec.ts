import { InputValidationException } from '@filesg/backend-common';
import {
  COMPONENT_ERROR_CODE,
  EXCEPTION_ERROR_CODE,
  FORMSG_FAIL_CATEGORY,
  NOTIFICATION_CHANNEL,
  RECALLABLE_TRANSACTION_TYPES,
  TRANSACTION_CREATION_METHOD,
} from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockApplicationTypeNotificationEntityService } from '../../../entities/application-type-notification/__mocks__/application-type-notification.entity.service.mock';
import { ApplicationTypeNotificationEntityService } from '../../../entities/application-type-notification/application-type-notification.entity.service';
import { mockNotificationMessageTemplateEntityService } from '../../../entities/notification-message-template/__mocks__/notification-message-template.entity.service.mock';
import { NotificationMessageTemplateEntityService } from '../../../entities/notification-message-template/notification-message-template.entity.service';
import { mockTransactionUuid } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { mockTransactionCustomMessageTemplateEntityService } from '../../../entities/transaction-custom-message-template/__mocks__/transaction-custom-message-template.entity.service.mock';
import { TransactionCustomMessageTemplateEntityService } from '../../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.service';
import { mockEserviceUserEntityService } from '../../../entities/user/__mocks__/eservice-user.entity.service.mock';
import { EserviceUserEntityService } from '../../../entities/user/eservice-user.entity.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import { mockRequestorEmail } from '../../queue-handler/__mocks__/formsg-event.service.mock';
import { mockFileTransactionV2Service } from '../../transaction/__mocks__/file-transaction.v2.service.mock';
import { mockRecallTransactionService } from '../../transaction/__mocks__/recall-transaction.service.mock';
import { FileTransactionV2Service } from '../../transaction/file-transaction.v2.service';
import { RecallTransactionService } from '../../transaction/recall-transaction.service';
import { mockFormSgService } from '../__mocks__/formsg.service.mock';
import {
  mockCreateFormSgFileTransactionRequest,
  mockCreateFormSgFileTransactionRequestWithoutShortCustomMessage,
  mockCreateTransactionV2Request,
  mockCreateTransactionV2RequestWithoutShortCustomMessage,
  mockEmailApplicationTypeNotification,
  mockEmailNotificationMessageTemplate,
  mockEserviceUser,
  mockEserviceWhitelistedUser,
  mockSgnotifyApplicationTypeNotification,
  mockSgnotifyNotificationMessageTemplate,
  mockTransactionCustomMessageTemplate,
  TestFormsgTransactionService,
} from '../__mocks__/formsg-transaction.service.mock';
import { FormSgService } from '../formsg.service';

describe('FormsgTransactionService', () => {
  let service: TestFormsgTransactionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFormsgTransactionService,
        { provide: FormSgService, useValue: mockFormSgService },
        { provide: FileTransactionV2Service, useValue: mockFileTransactionV2Service },
        { provide: EserviceUserEntityService, useValue: mockEserviceUserEntityService },
        { provide: ApplicationTypeNotificationEntityService, useValue: mockApplicationTypeNotificationEntityService },
        { provide: NotificationMessageTemplateEntityService, useValue: mockNotificationMessageTemplateEntityService },
        { provide: TransactionCustomMessageTemplateEntityService, useValue: mockTransactionCustomMessageTemplateEntityService },
        { provide: RecallTransactionService, useValue: mockRecallTransactionService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<TestFormsgTransactionService>(TestFormsgTransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFormsgTransaction', () => {
    beforeEach(() => {
      // mockEserviceUserEntityService.retrieveEserviceUserByActiveWhitelistEmail.mockResolvedValueOnce(mockEserviceUser);
      mockTransactionCustomMessageTemplateEntityService.retrieveFormsgTransactionCustomMessageTemplatesByEserviceUserId.mockResolvedValueOnce(
        mockTransactionCustomMessageTemplate,
      );
      mockApplicationTypeNotificationEntityService.retrieveNotificationChannelsForApplicationTypeByCodeAndEserviceUserId.mockResolvedValueOnce(
        [mockEmailApplicationTypeNotification, mockSgnotifyApplicationTypeNotification],
      );
      mockNotificationMessageTemplateEntityService.retrieveFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels.mockResolvedValueOnce(
        [mockEmailNotificationMessageTemplate, mockSgnotifyNotificationMessageTemplate],
      );
      mockFormSgService.verifyRequestorEmail.mockResolvedValueOnce(mockEserviceUser);
    });

    it('should be defined', () => {
      expect(service.createFormSgTransaction).toBeDefined();
    });

    it('should call handler functions with correct values', async () => {
      const { application, requestorEmail, files } = mockCreateFormSgFileTransactionRequest;

      await service.createFormSgTransaction(mockCreateFormSgFileTransactionRequest);

      expect(mockFormSgService.verifyRequestorEmail).toBeCalledWith(requestorEmail);
      expect(
        mockTransactionCustomMessageTemplateEntityService.retrieveFormsgTransactionCustomMessageTemplatesByEserviceUserId,
      ).toBeCalledWith(mockEserviceUser.id);
      expect(
        mockApplicationTypeNotificationEntityService.retrieveNotificationChannelsForApplicationTypeByCodeAndEserviceUserId,
      ).toBeCalledWith(application.type, mockEserviceUser.id);
      expect(
        mockNotificationMessageTemplateEntityService.retrieveFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels,
      ).toBeCalledWith(mockEserviceUser.id, [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.SG_NOTIFY]);
      expect(mockFileTransactionV2Service.createFileTransaction).toBeCalledWith(
        mockEserviceUser.id,
        {
          application,
          files,
          transaction: mockCreateTransactionV2Request,
        },
        mockEserviceWhitelistedUser,
      );
    });

    it('should use longCustomMessage for SG NOTIFY custom message if no shortCustomMessage is provided', async () => {
      const { application, files } = mockCreateFormSgFileTransactionRequest;

      await service.createFormSgTransaction(mockCreateFormSgFileTransactionRequestWithoutShortCustomMessage);

      expect(mockFileTransactionV2Service.createFileTransaction).toBeCalledWith(
        mockEserviceUser.id,
        {
          application,
          files,
          transaction: mockCreateTransactionV2RequestWithoutShortCustomMessage,
        },
        mockEserviceWhitelistedUser,
      );
    });

    it('should throw InputValidationException if appType does not exist', async () => {
      mockApplicationTypeNotificationEntityService.retrieveNotificationChannelsForApplicationTypeByCodeAndEserviceUserId
        .mockReset()
        .mockResolvedValueOnce([]);

      const inputValidationError = [
        {
          property: 'application',
          children: [
            {
              property: 'type',
              children: [],
              constraints: {
                isApplicationTypeValid: 'Application Type does not exist',
              },
            },
          ],
        },
      ];

      await expect(service.createFormSgTransaction(mockCreateFormSgFileTransactionRequest)).rejects.toThrowError(
        new InputValidationException(COMPONENT_ERROR_CODE.FORMSG_SERVICE, inputValidationError),
      );
    });
  });

  describe('generateTemplateInput', () => {
    it('should be defined', () => {
      expect(service.generateTemplateInput).toBeDefined();
    });
    it('should return N key-value pairs when paragraphCount is N', () => {
      const N = 6;
      expect(service.generateTemplateInput(['a', 'b', 'c'], N)).toEqual({
        paragraph1: 'a',
        paragraph2: 'b',
        paragraph3: 'c',
        paragraph4: '',
        paragraph5: '',
        paragraph6: '',
      });
    });
  });

  describe('recall transaction', () => {
    it('should be defined', () => {
      expect(service.recallTransaction).toBeDefined();
    });

    it('should verify if the requestor email is whitlelisted', async () => {
      await service.recallTransaction(mockTransactionUuid, mockRequestorEmail);
      expect(mockFormSgService.verifyRequestorEmail).toBeCalledWith(mockRequestorEmail);
    });

    it('should call recall transaction if requestor email is whitelisted', async () => {
      mockFormSgService.verifyRequestorEmail.mockResolvedValueOnce(mockEserviceUser);
      await service.recallTransaction(mockTransactionUuid, mockRequestorEmail);

      expect(mockRecallTransactionService.recallTransaction).toBeCalledWith(
        mockTransactionUuid,
        mockEserviceUser.id,
        { creationMethod: TRANSACTION_CREATION_METHOD.FORMSG },
        mockEserviceUser.whitelistedUsers![0],
      );
    });

    it('should send failure email for non whitelister email', async () => {
      mockFormSgService.verifyRequestorEmail.mockRejectedValueOnce(
        new InputValidationException(
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
          `Agency user email provided ${mockRequestorEmail} is not whitelisted`,
          `Eservice user not found with email: ${mockRequestorEmail}`,
          EXCEPTION_ERROR_CODE.AGENCY_EMAIL_NOT_WHITELISTED,
        ),
      );

      await expect(service.recallTransaction(mockTransactionUuid, mockRequestorEmail)).rejects.toThrowError();
      expect(mockEmailService.sendRecallFailureEmailToAgency).toBeCalledWith(
        mockTransactionUuid,
        FORMSG_FAIL_CATEGORY.AGENCY_EMAIL_NOT_WHITELISTED,
        mockRequestorEmail,
      );
    });

    it('should send failure email when wrong transaction uuid was provided', async () => {
      mockFormSgService.verifyRequestorEmail.mockResolvedValueOnce(mockEserviceUser);
      mockRecallTransactionService.recallTransaction.mockRejectedValueOnce(
        new InputValidationException(
          COMPONENT_ERROR_CODE.RECALL_SERVICE,
          `Recallable transactions must be of types: ${RECALLABLE_TRANSACTION_TYPES.toString()} and in a completed status.`,
          'internalErrorMsg',
          EXCEPTION_ERROR_CODE.TRANSACTION_IS_INVALID,
        ),
      );

      await expect(service.recallTransaction(mockTransactionUuid, mockRequestorEmail)).rejects.toThrowError();
      expect(mockEmailService.sendRecallFailureEmailToAgency).toBeCalledWith(
        mockTransactionUuid,
        FORMSG_FAIL_CATEGORY.INVALID_TRANSACTION_UUID,
        mockRequestorEmail,
      );
    });

    it('should send failure email some unexpected error occurs', async () => {
      mockFormSgService.verifyRequestorEmail.mockResolvedValueOnce(mockEserviceUser);
      mockRecallTransactionService.recallTransaction.mockRejectedValueOnce(new Error('random error'));

      await expect(service.recallTransaction(mockTransactionUuid, mockRequestorEmail)).rejects.toThrowError();
      expect(mockEmailService.sendRecallFailureEmailToAgency).toBeCalledWith(
        mockTransactionUuid,
        FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR,
        mockRequestorEmail,
      );
    });
  });
});
