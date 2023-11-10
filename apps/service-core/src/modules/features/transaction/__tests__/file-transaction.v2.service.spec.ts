import { InputValidationException, JWT_TYPE } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  AgencyFileUpload,
  COMPONENT_ERROR_CODE,
  CreateFileTransactionResponse,
  CreateFileTransactionV2Request,
  EXCEPTION_ERROR_CODE,
  FILE_STATUS,
  FILE_TYPE,
  NOTIFICATION_CHANNEL,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
} from '@filesg/common';
import { CreateRecipientRequest } from '@filesg/common';
import { FILESG_REDIS_CLIENT, FILESG_REDIS_NAMESPACE, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

import { UnsupportedTransactionTypeException } from '../../../../common/filters/custom-exceptions.filter';
import { TransactionCreationModel } from '../../../../entities/transaction';
import { ActivityRecipientInfo, FILE_ASSET_TYPE } from '../../../../typings/common';
import { docEncryptionPasswordEncryptionTransformer } from '../../../../utils/encryption';
import { mockAcknowledgementTemplateEntityService } from '../../../entities/acknowledgement-template/__mocks__/acknowledgement-template.entity.service.mock';
import { createMockAcknowledgementTemplate } from '../../../entities/acknowledgement-template/__mocks__/acknowledgement-template.mock';
import { AcknowledgementTemplateEntityService } from '../../../entities/acknowledgement-template/acknowledgement-template.entity.service';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockApplicationEntityService } from '../../../entities/application/__mocks__/application.entity.service.mock';
import { ApplicationEntityService } from '../../../entities/application/application.entity.service';
import { mockApplicationTypeEntityService } from '../../../entities/application-type/__mocks__/application-type.entity.service.mock';
import { ApplicationTypeEntityService } from '../../../entities/application-type/application-type.entity.service';
import { mockApplicationTypeNotificationEntityService } from '../../../entities/application-type-notification/__mocks__/application-type-notification.entity.service.mock';
import { ApplicationTypeNotificationEntityService } from '../../../entities/application-type-notification/application-type-notification.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockFileAssetHistoryEntityService } from '../../../entities/file-asset-history/__mocks__/file-asset-history.entity.service.mock';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { mockNotificationMessageInputEntityService } from '../../../entities/notification-message-input/__mocks__/notification-message-input.entity.service.mock';
import { NotificationMessageInputEntityService } from '../../../entities/notification-message-input/notification-message-input.entity.service';
import {
  mockNotificationMessageTemplate,
  mockNotificationMessageTemplateEntityService,
} from '../../../entities/notification-message-template/__mocks__/notification-message-template.entity.service.mock';
import { NotificationMessageTemplateEntityService } from '../../../entities/notification-message-template/notification-message-template.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockTransactionCustomMessageTemplateEntityService } from '../../../entities/transaction-custom-message-template/__mocks__/transaction-custom-message-template.entity.service.mock';
import { TransactionCustomMessageTemplateEntityService } from '../../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.service';
import { mockCitizenUserEntityService } from '../../../entities/user/__mocks__/citizen-user.entity.service.mock';
import { mockCorporateEntityService } from '../../../entities/user/__mocks__/corporate/corporate.entity.service.mock';
import { mockUserEntityService } from '../../../entities/user/__mocks__/user.entity.service.mock';
import { CitizenUserEntityService } from '../../../entities/user/citizen-user.entity.service';
import { CorporateEntityService } from '../../../entities/user/corporate/corporate.entity.service';
import { UserEntityService } from '../../../entities/user/user.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockDatabaseTransaction, mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockAuthService } from '../../auth/__mocks__/auth.service.mock';
import { AuthService } from '../../auth/auth.service';
import { mockEmailBlackListService } from '../../email/__mocks__/email-black-list.service.mock';
import { EmailBlackListService } from '../../email/email-black-list.service';
import {
  mockAcknowledgementTemplate,
  mockAcknowledgementTemplateUuid,
  mockApplication,
  mockApplicationType,
  mockCitizenUser,
  mockCreateFileTransactionRecipientResponse,
  mockEncryptedAgencyPassword,
  mockExistingUsers,
  mockFileAssetModels,
  mockFileInfos,
  mockFileSessionId,
  mockFileUploadInfo,
  mockFileUploadJwt,
  mockInsertCitizenUsersResult,
  mockInsertFileAssetsForTxnCreationFileAsset,
  mockInsertFileAssetsForTxnCreationInsertFileAssetsResult,
  mockInsertFileAssetsForTxnCreationTxnCreationFileAssetInsert,
  mockInsertOwnerFileAssetsForTxnCreationResults,
  mockInsertReceiveTransferActivitiesResults,
  mockInsertTransferredFileAssetsResult,
  mockProgrammaticUser,
  mockReceiveTransferActivity,
  mockReceiveTransferFileAssetHistoryUuids,
  mockReceiveTransferFileAssetIds,
  mockSendTransferActivity,
  mockTransaction,
  mockTransactionInfo,
  mockTransferredFileAsset,
  mockTransferredFileAssetHistoriesCreationModel,
  mockTransferredTxnCreationFileAssetInsert,
  mockUploadActivity,
  mockUploadAndSendTransferActivityFileInserts,
  mockUploadAndSendTransferFileAssetHistoryUuids,
  mockUploadAndSendTransferFileAssetIds,
  mockUploadedFileAssetHistoriesCreationModel,
  mockUploadedFileAssetsForTxnCreationInsertResults,
  receiveTransferActivityFileInserts,
} from '../__mocks__/file-transaction.service.mock';
import {
  mockCreateFileTransactionV2Request,
  mockCustomTransactionMessage,
  mockCustomTransactionMessageResponse,
  requestNotUploadTransferV2Txn,
  TestFileTransactionV2Service,
} from '../__mocks__/file-transaction.v2.service.mock';

const helpers = require('../../../../utils/helpers');

describe('FileTransactionV2Service', () => {
  let service: TestFileTransactionV2Service;
  let mockEntityManager: EntityManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFileTransactionV2Service,
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: CorporateEntityService, useValue: mockCorporateEntityService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: CitizenUserEntityService, useValue: mockCitizenUserEntityService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: ApplicationEntityService, useValue: mockApplicationEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: ApplicationTypeEntityService, useValue: mockApplicationTypeEntityService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: EmailBlackListService, useValue: mockEmailBlackListService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: AcknowledgementTemplateEntityService, useValue: mockAcknowledgementTemplateEntityService },
        { provide: TransactionCustomMessageTemplateEntityService, useValue: mockTransactionCustomMessageTemplateEntityService },
        { provide: ApplicationTypeNotificationEntityService, useValue: mockApplicationTypeNotificationEntityService },
        { provide: NotificationMessageInputEntityService, useValue: mockNotificationMessageInputEntityService },
        { provide: NotificationMessageTemplateEntityService, useValue: mockNotificationMessageTemplateEntityService },
      ],
    }).compile();

    mockEntityManager = (await mockDatabaseTransactionService.startTransaction()).entityManager;

    service = module.get<TestFileTransactionV2Service>(TestFileTransactionV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyAndGenerateCustomMessage', () => {
    it('should generate transaction message by combining template and templateInput', async () => {
      jest.spyOn(mockTransactionCustomMessageTemplateEntityService, 'retrieveTransactionCustomMessageTemplate').mockResolvedValue({
        uuid: 'transactioncustommessagetemplate-1654395064012-u1v2w3x4y5z6a7b8',
        template: ['This is the first paragraph and will contain dynamic variable {{variableOne}}'],
        requiredFields: ['variableOne'],
      });
      expect(await service.verifyAndGenerateCustomMessage(mockCustomTransactionMessage, 1)).toEqual([
        'This is the first paragraph and will contain dynamic variable test variable',
      ]);
    });

    describe('errors', () => {
      it('should fail templateId does not below to agency or no template found', async () => {
        jest.spyOn(mockTransactionCustomMessageTemplateEntityService, 'retrieveTransactionCustomMessageTemplate').mockResolvedValue(null);
        await expect(service.verifyAndGenerateCustomMessage(mockCustomTransactionMessage, 1)).rejects.toThrowError(
          new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Invalid transaction templateId'),
        );
      });

      it('should fail if required fields was not provided by the user', async () => {
        jest.spyOn(mockTransactionCustomMessageTemplateEntityService, 'retrieveTransactionCustomMessageTemplate').mockResolvedValueOnce({
          uuid: 'transactioncustommessagetemplate-1654395064012-u1v2w3x4y5z6a7b8',
          template: ['This is the first paragraph and will contain dynamic variable {{variableOne}}'],
          requiredFields: ['variableOne'],
        });

        await expect(
          service.verifyAndGenerateCustomMessage({ templateId: 'transactioncustommessagetemplate-1654395064012-u1v2w3x4y5z6a7b8' }, 1),
        ).rejects.toThrowError(InputValidationException);
      });
    });
  });

  describe('validateRequiredFieldsForTemplate', () => {
    it('should pass if the passed arrays are equal', () => {
      expect(() => service.validateAndCompareArrays(['one', 'two'], ['one', 'two'], 'templateId-01')).not.toThrowError();
    });

    describe('errors', () => {
      it('should throw exception if the transaction has additional fields', () => {
        expect(() => service.validateAndCompareArrays(['one', 'two'], ['one', 'two', 'three'], 'templateId-01')).toThrowError(
          InputValidationException,
        );
      });
      it('should throw exception if the transaction has missing fields', () => {
        expect(() => service.validateAndCompareArrays(['one', 'two'], ['one'], 'templateId-01')).toThrowError(InputValidationException);
      });
    });
  });

  // TODO: update test
  describe.skip('verifyNotificationChannelAndTemplateAndSave', () => {
    const expectedSuccessResponse = [
      {
        notificationChannel: 'EMAIL',
        notificationMessageTemplate: {
          uuid: 'notificationmessagetemplate-1655110619636-03e9d4ac12637a54',
          version: 1,
          requiredFields: ['variableOne'],
        },
        templateInput: {
          variableOne: 'Hello World',
        },
        templateVersion: 1,
      },
      {
        notificationChannel: 'SG_NOTIFY',
        notificationMessageTemplate: {
          uuid: 'notificationmessagetemplate-1655110619636-03e9d4ac12637a55',
          version: 1,
          requiredFields: ['variableOne'],
        },
        templateInput: {
          variableOne: 'Hello World',
        },
        templateVersion: 1,
      },
    ];

    // beforeEach(() => {
    //   mockApplicationTypeNotificationEntityService.retrieveNotificationChannelsForApplicationType.mockResolvedValueOnce([
    //     {
    //       notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
    //     },
    //     {
    //       notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
    //     },
    //   ]);

    //   const mockNotificationTemplate = {
    //     uuid: 'notificationmessagetemplate-1655110619636-03e9d4ac12637a54',
    //     version: 1,
    //     requiredFields: ['variableOne'],
    //   };

    //   const mockNotificationTemplate2 = {
    //     uuid: 'notificationmessagetemplate-1655110619636-03e9d4ac12637a55',
    //     version: 1,
    //     requiredFields: ['variableOne'],
    //   };

    //   mockNotificationMessageTemplateEntityService.retrieveNotificationTemplateUsingUuidAgencyIdAndNotificationChannel
    //     .mockResolvedValueOnce(mockNotificationTemplate)
    //     .mockResolvedValueOnce(mockNotificationTemplate2);
    // });

    // it('should verify that the notification channel and templates belong to applicationType', async () => {
    //   const {
    //     customAgencyMessage: { notifications },
    //     recipients,
    //   } = mockCreateFileTransactionV2Request.transaction;

    //   expect(await service.verifyNotificationChannelAndTemplateAndSave(notifications, 1, 1, recipients)).toEqual(expectedSuccessResponse);
    // });

    // describe('notification channel required fields', () => {
    //   beforeAll(() => {
    //     const mockedRequiredRecipientFields = jest.mocked(REQUIRED_RECIPIENT_FIELD_FOR_NOTIFICATION);
    //     mockedRequiredRecipientFields.SG_NOTIFY = 'contact';
    //   });

    //   it('should pass if all recipients have atleast one required field for notification', async () => {
    //     const {
    //       customAgencyMessage: { notifications },
    //     } = mockCreateFileTransactionV2Request.transaction;

    //     const recipients = [
    //       { name: 'John Doe', uin: 'S1111111A', contact: '+6511111111' },
    //       { name: 'Jane Doe', uin: 'S1111111B', email: 'jane@fakeemailprovider.com' },
    //     ];

    //     expect(await service.verifyNotificationChannelAndTemplateAndSave(notifications, 1, 1, recipients)).toEqual(expectedSuccessResponse);
    //   });

    //   it('should fail if the the provided recipients does not have atleast one required field for notification', async () => {
    //     const {
    //       customAgencyMessage: { notifications },
    //     } = mockCreateFileTransactionV2Request.transaction;

    //     const recipients = [{ name: 'John Doe', uin: 'S1111111A' }];

    //     try {
    //       await service.verifyNotificationChannelAndTemplateAndSave(notifications, 1, 1, recipients);
    //     } catch (error) {
    //       expect(error).toBeInstanceOf(InputValidationException);
    //       const errorMsg = ((error as InputValidationException).getResponse() as any).message.error;
    //       const expectedErrorMsg =
    //         'The following recipients: [John Doe] are missing the required field(s) for notification. Please provide at least one of the following fields: [email, contact].';
    //       expect(errorMsg).toBe(expectedErrorMsg);
    //     }
    //   });

    //   it('should fail if one of the recipients does not have atleast one required field for notification', async () => {
    //     const {
    //       customAgencyMessage: { notifications },
    //     } = mockCreateFileTransactionV2Request.transaction;

    //     const recipients = [
    //       { name: 'John Doe', uin: 'S1111111A', contact: '+6511111111' },
    //       { name: 'Jane Doe', uin: 'S1111111B' },
    //     ];

    //     try {
    //       await service.verifyNotificationChannelAndTemplateAndSave(notifications, 1, 1, recipients);
    //     } catch (error) {
    //       expect(error).toBeInstanceOf(InputValidationException);
    //       const errorMsg = ((error as InputValidationException).getResponse() as any).message.error;
    //       const expectedErrorMsg =
    //         'The following recipients: [Jane Doe] are missing the required field(s) for notification. Please provide at least one of the following fields: [email, contact].';
    //       expect(errorMsg).toBe(expectedErrorMsg);
    //     }
    //   });
    // });

    // describe('errors', () => {
    //   it('should fail if the notification channel provided does not belong to application type notification channels', async () => {
    //     const {
    //       customAgencyMessage: { notifications },
    //       recipients,
    //     } = mockCreateFileTransactionV2Request.transaction;

    //     notifications[0].channel = NOTIFICATION_CHANNEL.SG_NOTIFY;

    //     await expect(service.verifyNotificationChannelAndTemplateAndSave(notifications, 1, 1, recipients)).rejects.toThrowError(
    //       InputValidationException,
    //     );
    //   });

    //   it('should fail if the notification template id provided does not belong to agency', async () => {
    //     const {
    //       customAgencyMessage: { notifications },
    //       recipients,
    //     } = mockCreateFileTransactionV2Request.transaction;

    //     notifications[0].templateId = 'template-id-that-does-not-exist';

    //     await expect(service.verifyNotificationChannelAndTemplateAndSave(notifications, 1, 1, recipients)).rejects.toThrowError(
    //       InputValidationException,
    //     );
    //   });

    //   it('should fail if the notification template input provided does not match the required fields', async () => {
    //     const {
    //       customAgencyMessage: { notifications },
    //       recipients,
    //     } = mockCreateFileTransactionV2Request.transaction;

    //     notifications[0].templateInput = { variableTwo: 'random data' };

    //     await expect(service.verifyNotificationChannelAndTemplateAndSave(notifications, 1, 1, recipients)).rejects.toThrowError(
    //       InputValidationException,
    //     );
    //   });
    // });
  });

  describe('createFileTransaction', () => {
    beforeEach(async () => {
      mockUserEntityService.retrieveUserWithEserviceAndAgencyById.mockResolvedValueOnce(mockProgrammaticUser);
      mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid.mockResolvedValueOnce(mockAcknowledgementTemplate);

      // uploadTransferHandler
      const uploadTransferHandlerSpy = jest.spyOn(service, 'uploadTransferHandler');
      uploadTransferHandlerSpy.mockResolvedValueOnce(mockTransactionInfo);

      // generateFileUploadInfo
      const generateFileUploadInfoSpy = jest.spyOn(service, 'generateFileUploadInfo');
      generateFileUploadInfoSpy.mockReturnValueOnce(mockFileUploadInfo);

      // generateFileUploadJwt
      const generateFileUploadJwtSpy = jest.spyOn(service, 'generateFileUploadJwt');
      generateFileUploadJwtSpy.mockResolvedValueOnce(mockFileUploadJwt);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should call handler functions with correct values', async () => {
      const uploadTransferHandlerSpy = jest.spyOn(service, 'uploadTransferHandler');
      uploadTransferHandlerSpy.mockResolvedValueOnce(mockTransactionInfo);
      const generateFileUploadInfoSpy = jest.spyOn(service, 'generateFileUploadInfo');
      const generateFileUploadJwtSpy = jest.spyOn(service, 'generateFileUploadJwt');

      await service.createFileTransaction(mockProgrammaticUser.id, mockCreateFileTransactionV2Request);

      expect(mockUserEntityService.retrieveUserWithEserviceAndAgencyById).toBeCalledWith(mockProgrammaticUser.id);

      expect(mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid).toBeCalledWith(
        mockAcknowledgementTemplateUuid,
        { toThrow: false },
      );

      expect(uploadTransferHandlerSpy).toBeCalledWith(
        mockCreateFileTransactionV2Request,
        mockProgrammaticUser,
        undefined,
        mockAcknowledgementTemplate.id,
        false,
      );

      expect(generateFileUploadInfoSpy).toBeCalledWith(mockProgrammaticUser, mockTransactionInfo);

      const mockTtl = mockFileSGConfigService.redisConfig.fileUploadTtlInSeconds;
      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.FILE_SESSION,
        `${FILESG_REDIS_NAMESPACE.FILE_UPLOAD_INFO}:${mockTransactionInfo.transactionUuid}`,
        JSON.stringify(mockFileUploadInfo),
        undefined,
        mockTtl,
      );

      expect(generateFileUploadJwtSpy).toBeCalledWith(mockTransaction.uuid);
    });

    it('should return access token, txn uuid, files and recipients info when txn created successfully', async () => {
      const expectedResponse: CreateFileTransactionResponse = {
        accessToken: mockFileUploadJwt,
        transactionUuid: mockTransaction.uuid,
        files: [
          {
            name: mockCreateFileTransactionV2Request.files[0].name,
            uuid: mockInsertOwnerFileAssetsForTxnCreationResults.uuids[0],
          },
        ],
        recipients: [
          {
            activityUuid: mockReceiveTransferActivity.uuid,
            uin: mockCreateFileTransactionV2Request.transaction.recipients[0].uin!,
          },
        ],
      };

      expect(await service.createFileTransaction(mockProgrammaticUser.id, mockCreateFileTransactionV2Request)).toEqual(expectedResponse);
    });

    describe('error thrown', () => {
      it('should throw InputValidationException when duplicate recipient uin is given', async () => {
        const mockRecipientUser = mockCreateFileTransactionV2Request.transaction.recipients[0];
        const mockFailTransactionRequest: CreateFileTransactionV2Request = {
          ...mockCreateFileTransactionV2Request,
          transaction: {
            ...mockCreateFileTransactionV2Request.transaction,
            recipients: [mockRecipientUser, mockRecipientUser],
          },
        };

        await expect(service.createFileTransaction(mockProgrammaticUser.id, mockFailTransactionRequest)).rejects.toThrowError(
          new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Duplicate recipients UINs'),
        );
      });

      it('should throw InputValidationException when property acknowledgementTemplateUuid is given but isAcknowledgementRequired is false or undefined', async () => {
        const mockFailTransactionRequest: CreateFileTransactionV2Request = {
          ...mockCreateFileTransactionV2Request,
          transaction: { ...mockCreateFileTransactionV2Request.transaction, isAcknowledgementRequired: false },
        };

        await expect(service.createFileTransaction(mockProgrammaticUser.id, mockFailTransactionRequest)).rejects.toThrowError(
          new InputValidationException(
            COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
            `Property 'acknowledgementTemplateUuid' is not allowed when property 'isAcknowledgementRequired' is false or undefined.`,
          ),
        );
      });

      it('should throw InputValidationException when acknowledgementTemplate retrieved does not belongs to the same eservice as the user', async () => {
        const {
          transaction: { acknowledgementTemplateUuid },
        } = mockCreateFileTransactionV2Request;

        const mockWrongAcknowledgementTemplate = createMockAcknowledgementTemplate({
          id: 1,
          uuid: mockAcknowledgementTemplateUuid,
          name: 'LTVP Acknowledgement Template',
          content: {
            content: [
              {
                content: ['Some LTVP content'],
              },
            ],
          },
          eserviceId: 2,
        });

        mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid.mockReset();
        mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid.mockResolvedValueOnce(
          mockWrongAcknowledgementTemplate,
        );

        await expect(service.createFileTransaction(mockProgrammaticUser.id, mockCreateFileTransactionV2Request)).rejects.toThrowError(
          new InputValidationException(
            COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
            `Acknowledge template of uuid ${acknowledgementTemplateUuid} does not exist`,
          ),
        );
      });

      it('should throw InputValidationException when acknowledgementTemplate retrieved does not exist', async () => {
        const {
          transaction: { acknowledgementTemplateUuid },
        } = mockCreateFileTransactionV2Request;

        mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid.mockReset();
        mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid.mockResolvedValueOnce(null);

        await expect(service.createFileTransaction(mockProgrammaticUser.id, mockCreateFileTransactionV2Request)).rejects.toThrowError(
          new InputValidationException(
            COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
            `Acknowledge template of uuid ${acknowledgementTemplateUuid} does not exist`,
          ),
        );
      });

      it('should throw UnsupportedTransactionTypeException when called with transaction not of type upload transfer', async () => {
        const mockUserId = 1;

        mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid.mockReset();
        mockAcknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid.mockResolvedValueOnce(mockAcknowledgementTemplate);

        await expect(service.createFileTransaction(mockUserId, requestNotUploadTransferV2Txn)).rejects.toThrowError(
          UnsupportedTransactionTypeException,
        );
      });
    });
  });

  describe('uploadTransferHandler', () => {
    let createTransactionByRequestSpy: jest.SpyInstance;
    let saveActivityForTxnCreationSpy: jest.SpyInstance;
    let insertFileAssetsForTxnCreationSpy: jest.SpyInstance;
    let getOrCreateUserSpy: jest.SpyInstance;
    let createReceiveTransferActivitiesAndFilesForUsersSpy: jest.SpyInstance;
    let docEncryptionPasswordEncryptionTransformerToSpy: jest.SpyInstance;

    beforeEach(() => {
      // mocks for createTransactionByRequest
      createTransactionByRequestSpy = jest.spyOn(service, 'createTransactionByRequest');
      createTransactionByRequestSpy.mockResolvedValueOnce(mockTransaction);

      // mock for saveActivityForTxnCreation
      saveActivityForTxnCreationSpy = jest.spyOn(service, 'saveActivityForTxnCreation');
      saveActivityForTxnCreationSpy.mockResolvedValueOnce(mockUploadActivity).mockResolvedValueOnce(mockSendTransferActivity);

      // mocks for insertFileAssetsForTxnCreation
      insertFileAssetsForTxnCreationSpy = jest.spyOn(service, 'insertFileAssetsForTxnCreation');
      insertFileAssetsForTxnCreationSpy.mockResolvedValueOnce(mockUploadedFileAssetsForTxnCreationInsertResults);

      // mocks for getOrCreateUser
      getOrCreateUserSpy = jest.spyOn(service, 'getOrCreateUser');
      getOrCreateUserSpy.mockResolvedValueOnce(mockExistingUsers);

      // mocks for createReceiveTransferActivitiesAndFilesForUsers
      createReceiveTransferActivitiesAndFilesForUsersSpy = jest.spyOn(service, 'createReceiveTransferActivitiesAndFilesForUsers');
      createReceiveTransferActivitiesAndFilesForUsersSpy.mockResolvedValueOnce({
        receiveTransferFileAssetIds: mockReceiveTransferFileAssetIds,
        fileAssetModels: mockFileAssetModels,
        recipients: mockCreateFileTransactionRecipientResponse,
      });

      //FIXME: encrypter not able to get env values. To remove after convert after converting to provider
      docEncryptionPasswordEncryptionTransformerToSpy = jest.spyOn(docEncryptionPasswordEncryptionTransformer, 'to');
      docEncryptionPasswordEncryptionTransformerToSpy.mockReturnValue(mockEncryptedAgencyPassword);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should call handler functions with correct values', async () => {
      const validateNoDuplicateFileNamesSpy = jest.spyOn(service, 'validateNoDuplicateFileNames');
      const validateRecipientEmailsSpy = jest.spyOn(service, 'validateRecipientEmails');

      const generateEntityUUIDSpy = jest.spyOn(helpers, 'generateEntityUUID');
      generateEntityUUIDSpy
        .mockReturnValueOnce(mockUploadAndSendTransferFileAssetHistoryUuids[0])
        .mockReturnValueOnce(mockReceiveTransferFileAssetHistoryUuids[0]);

      await service.uploadTransferHandler(
        mockCreateFileTransactionV2Request,
        mockProgrammaticUser,
        undefined,
        mockAcknowledgementTemplate.id,
        false,
      );

      expect(validateNoDuplicateFileNamesSpy).toBeCalledWith(mockCreateFileTransactionV2Request.files);

      const recipientEmails: string[] = [];
      mockCreateFileTransactionV2Request.transaction.recipients.forEach(({ email }) => email && recipientEmails.push(email));
      expect(validateRecipientEmailsSpy).toBeCalledWith(recipientEmails);

      expect(createTransactionByRequestSpy).toBeCalledWith(
        mockCreateFileTransactionV2Request.transaction,
        mockCreateFileTransactionV2Request.application,
        mockProgrammaticUser,
        undefined,
        false,
        mockEntityManager,
      );

      expect(saveActivityForTxnCreationSpy).toBeCalledWith(
        ACTIVITY_TYPE.UPLOAD,
        mockTransaction,
        mockProgrammaticUser,
        undefined,
        undefined,
        mockEntityManager,
      );

      expect(saveActivityForTxnCreationSpy).toBeCalledWith(
        ACTIVITY_TYPE.SEND_TRANSFER,
        mockTransaction,
        mockProgrammaticUser,
        mockUploadActivity,
        mockCreateFileTransactionV2Request.transaction.isAcknowledgementRequired,
        mockEntityManager,
      );

      expect(insertFileAssetsForTxnCreationSpy).toBeCalledWith(
        mockCreateFileTransactionV2Request.files.map((file) => {
          return {
            fileInfo: file,
            ownerId: mockProgrammaticUser.id,
            issuerId: mockProgrammaticUser.id,
            type: FILE_ASSET_TYPE.UPLOADED,
          };
        }),
        mockEntityManager,
      );

      expect(insertFileAssetsForTxnCreationSpy).toBeCalledWith(
        mockCreateFileTransactionV2Request.files.map((file) => {
          return {
            fileInfo: file,
            ownerId: mockProgrammaticUser.id,
            issuerId: mockProgrammaticUser.id,
            type: FILE_ASSET_TYPE.UPLOADED,
          };
        }),
        mockEntityManager,
      );

      expect(await mockActivityEntityService.insertActivityFiles).toBeCalledWith(
        mockUploadAndSendTransferActivityFileInserts,
        mockEntityManager,
      );

      expect(await mockFileAssetHistoryEntityService.insertFileAssetHistories).toBeCalledWith(
        mockUploadedFileAssetHistoriesCreationModel,
        mockEntityManager,
      );

      expect(getOrCreateUserSpy).toBeCalledWith(mockCreateFileTransactionV2Request.transaction.recipients, mockEntityManager);

      expect(createReceiveTransferActivitiesAndFilesForUsersSpy).toBeCalledWith(
        { [mockCitizenUser.id]: mockCreateFileTransactionV2Request.transaction.recipients[0] },
        mockTransaction,
        mockSendTransferActivity,
        mockCreateFileTransactionV2Request.files,
        mockProgrammaticUser.id,
        mockUploadAndSendTransferFileAssetIds,
        mockCreateFileTransactionV2Request.transaction.isAcknowledgementRequired,
        mockAcknowledgementTemplate.id,
        false,
        mockEntityManager,
      );

      expect(await mockFileAssetHistoryEntityService.insertFileAssetHistories).toBeCalledWith(
        mockTransferredFileAssetHistoriesCreationModel,
        mockEntityManager,
      );

      expect(mockDatabaseTransaction.commit).toBeCalledTimes(1);
    });

    it('should return txn uuid, files and recipients when success', async () => {
      expect(
        await service.uploadTransferHandler(
          mockCreateFileTransactionV2Request,
          mockProgrammaticUser,
          undefined,
          mockAcknowledgementTemplate.id,
        ),
      ).toEqual({
        creationMethod: TRANSACTION_CREATION_METHOD.API,
        transactionUuid: mockTransaction.uuid,
        files: mockFileInfos,
        recipients: mockCreateFileTransactionRecipientResponse,
      });
    });

    it('should encrypt agencyPassword before returning', async () => {
      await service.uploadTransferHandler(mockCreateFileTransactionV2Request, mockProgrammaticUser);

      expect(docEncryptionPasswordEncryptionTransformerToSpy).toBeCalledWith(
        JSON.stringify(mockCreateFileTransactionV2Request.files[0].agencyPassword),
      );
      expect(mockDatabaseTransactionService.startTransaction).toBeCalledTimes(1);
    });

    it('should rollback database transaction if error is thrown during entities creation', async () => {
      createTransactionByRequestSpy.mockReset();
      createTransactionByRequestSpy.mockRejectedValueOnce(new Error());

      await expect(service.uploadTransferHandler(mockCreateFileTransactionV2Request, mockProgrammaticUser)).rejects.toThrowError();

      expect(mockDatabaseTransaction.rollback).toBeCalledTimes(1);
    });
  });

  describe('validateNoDuplicateFileNames', () => {
    it('should throw DuplicateFileNameException when given duplicate file names', () => {
      const mockDuplicateFileNamesAgencyFileUploads: AgencyFileUpload[] = mockCreateFileTransactionV2Request.files.concat(
        mockCreateFileTransactionV2Request.files,
      );

      // Synchronous functions need to be wrapped in a function when throwing error, otherwise the error will not be caught and the assertion will fail.
      // https://jestjs.io/docs/expect#tothrowerror
      expect(() => service.validateNoDuplicateFileNames(mockDuplicateFileNamesAgencyFileUploads)).toThrow(
        new InputValidationException(
          COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
          'The file names provided contain duplicates. Please provide unique name for each file.',
          undefined,
          EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES,
        ),
      );
    });
  });

  describe('validateRecipientEmails', () => {
    const recipients: CreateRecipientRequest[] = [
      {
        name: 'MOCK NAME S3002610A',
        contact: '+6581234567',
        email: 'user1@gmail.com',
        uin: 'S3002610A',
        dob: '1995-01-01',
      },
      {
        name: 'MOCK NAME S3002611A',
        contact: '+65823456789',
        email: 'user2@gmail.com',
        uin: 'S3002611A',
        dob: '1995-01-01',
      },
    ];

    const recipientEmails: string[] = [];
    recipients.forEach(({ email }) => email && recipientEmails.push(email));

    it(`should throw EmailInBlackListException when one of recipient's email is blacklisted`, async () => {
      const blacklistedEmail = 'user2@gmail.com';
      mockEmailBlackListService.isEmailBlackListed.mockImplementation(async (emailAddress) => emailAddress === blacklistedEmail);

      await expect(service.validateRecipientEmails(recipientEmails)).rejects.toThrowError(
        new InputValidationException(
          COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
          `The following email(s): ${[blacklistedEmail].join(
            ', ',
          )} belong to a blacklist. Please provide an alternative email address for the above mentioned.`,
          undefined,
          EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED,
        ),
      );

      mockEmailBlackListService.isEmailBlackListed.mockReset();
    });

    it(`should return void when all the recipient's email is not blacklisted`, async () => {
      await expect(service.validateRecipientEmails(recipientEmails)).resolves.not.toThrow();
    });
  });

  describe('createTransactionByRequest', () => {
    const { transaction: createTransactionReq, application: createApplicationReq } = mockCreateFileTransactionV2Request;
    const { name: transactionName, type: transactionType } = createTransactionReq;
    const userEservice = mockProgrammaticUser.eservices![0];

    beforeEach(() => {
      jest.spyOn(service, 'verifyAndGenerateCustomMessage').mockResolvedValueOnce(mockCustomTransactionMessageResponse);
      jest.spyOn(service, 'verifyNotificationChannelAndTemplateAndSave').mockResolvedValueOnce([
        {
          notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
          notificationMessageTemplate: mockNotificationMessageTemplate,
          templateVersion: 1,
          templateInput: null,
        },
      ]);
    });

    describe('when only applicationType is given', () => {
      beforeEach(() => {
        mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId.mockResolvedValueOnce(mockApplicationType);
        mockApplicationEntityService.saveApplication.mockResolvedValueOnce(mockApplication);
        jest.spyOn(helpers, 'generateFileSessionUUID').mockReturnValueOnce(mockFileSessionId);
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

      it('should create new application and transaction (with API creation method when the property value is not provided in the request)', async () => {
        const applicationReqWithoutExternalRefId = { type: createApplicationReq.type };

        await service.createTransactionByRequest(createTransactionReq, applicationReqWithoutExternalRefId, mockProgrammaticUser);

        expect(mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId).toBeCalledWith(
          applicationReqWithoutExternalRefId.type,
          userEservice.id,
          undefined,
        );

        expect(mockApplicationEntityService.saveApplication).toBeCalledWith(
          { applicationType: mockApplicationType, eservice: userEservice },
          undefined,
        );

        const creationModel: TransactionCreationModel = {
          name: transactionName,
          type: transactionType,
          status: TRANSACTION_STATUS.INIT,
          creationMethod: TRANSACTION_CREATION_METHOD.API,
          fileSessionId: mockFileSessionId,
          customMessage: mockCustomTransactionMessageResponse,
          application: mockApplication,
          user: mockProgrammaticUser,
        };

        expect(mockTransactionEntityService.saveTransaction).toBeCalledWith(creationModel, undefined);
      });

      it('should create new application and transaction (with creation method when the property value is provided in the request)', async () => {
        const mockCreateFileTransactionRequestWithTransactionCreationMethod: CreateFileTransactionV2Request = {
          ...mockCreateFileTransactionV2Request,
          transaction: { ...mockCreateFileTransactionV2Request.transaction, creationMethod: TRANSACTION_CREATION_METHOD.SFTP },
        };

        const { transaction, application } = mockCreateFileTransactionRequestWithTransactionCreationMethod;

        const applicationReqWithoutExternalRefId = { type: application.type };

        await service.createTransactionByRequest(transaction, applicationReqWithoutExternalRefId, mockProgrammaticUser);

        expect(mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId).toBeCalledWith(
          applicationReqWithoutExternalRefId.type,
          userEservice.id,
          undefined,
        );

        expect(mockApplicationEntityService.saveApplication).toBeCalledWith(
          { applicationType: mockApplicationType, eservice: userEservice },
          undefined,
        );

        const creationModel: TransactionCreationModel = {
          name: transactionName,
          type: transactionType,
          status: TRANSACTION_STATUS.INIT,
          creationMethod: TRANSACTION_CREATION_METHOD.SFTP,
          fileSessionId: mockFileSessionId,
          customMessage: mockCustomTransactionMessageResponse,
          application: mockApplication,
          user: mockProgrammaticUser,
        };

        expect(mockTransactionEntityService.saveTransaction).toBeCalledWith(creationModel, undefined);
      });
    });

    describe('when applicationType and externalRefId are given', () => {
      afterEach(() => {
        expect(mockApplicationEntityService.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId).toBeCalledWith(
          createApplicationReq.externalRefId,
          userEservice.id,
          mockApplicationType.id,
          { entityManager: undefined, toThrow: false },
        );
        expect(mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId).toBeCalledWith(
          createApplicationReq.type,
          userEservice.id,
          undefined,
        );

        const creationModel: TransactionCreationModel = {
          name: transactionName,
          type: transactionType,
          status: TRANSACTION_STATUS.INIT,
          creationMethod: TRANSACTION_CREATION_METHOD.API,
          fileSessionId: mockFileSessionId,
          customMessage: mockCustomTransactionMessageResponse,
          application: mockApplication,
          user: mockProgrammaticUser,
        };
        expect(mockTransactionEntityService.saveTransaction).toBeCalledWith(creationModel, undefined);
      });

      it('should use existing application when found with the given applicationType and externalRefId', async () => {
        mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId.mockReset();
        mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId.mockResolvedValueOnce(mockApplicationType);

        mockApplicationEntityService.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId.mockResolvedValueOnce(
          mockApplication,
        );
        jest.spyOn(helpers, 'generateFileSessionUUID').mockReturnValueOnce(mockFileSessionId);

        await service.createTransactionByRequest(createTransactionReq, createApplicationReq, mockProgrammaticUser);

        expect(mockApplicationEntityService.saveApplication).toBeCalledTimes(0);
      });

      it('should create new application with applicationType and externalRefId when no existing application found with given applicationType and externalRefId', async () => {
        mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId.mockReset();
        mockApplicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId.mockResolvedValueOnce(mockApplicationType);

        mockApplicationEntityService.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId.mockReset();
        mockApplicationEntityService.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId.mockResolvedValueOnce(null);
        mockApplicationEntityService.saveApplication.mockResolvedValueOnce(mockApplication);
        jest.spyOn(helpers, 'generateFileSessionUUID').mockReturnValueOnce(mockFileSessionId);

        await service.createTransactionByRequest(createTransactionReq, createApplicationReq, mockProgrammaticUser);

        expect(mockApplicationEntityService.upsertApplication).toBeCalledWith(
          { externalRefId: createApplicationReq.externalRefId, applicationType: mockApplicationType, eservice: userEservice },
          undefined,
        );
      });
    });
  });

  describe('saveActivityForTxnCreation', () => {
    it(`should call saveActivity function with right params, and return the created activity`, async () => {
      mockActivityEntityService.saveActivity.mockResolvedValueOnce(mockReceiveTransferActivity);

      expect(await service.saveActivityForTxnCreation(ACTIVITY_TYPE.RECEIVE_TRANSFER, mockTransaction, mockProgrammaticUser)).toEqual(
        mockReceiveTransferActivity,
      );

      expect(mockActivityEntityService.saveActivity).toBeCalledWith(
        {
          status: ACTIVITY_STATUS.INIT,
          type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
          transaction: mockTransaction,
          user: mockProgrammaticUser,
          parent: undefined,
        },
        undefined,
      );
    });
  });

  describe('insertFileAssetsForTxnCreation', () => {
    beforeEach(() => {
      mockFileAssetEntityService.buildFileAsset.mockReturnValueOnce(mockInsertFileAssetsForTxnCreationFileAsset);
      mockFileAssetEntityService.insertFileAssets.mockResolvedValueOnce(mockInsertFileAssetsForTxnCreationInsertFileAssetsResult);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return the correct values with given arguments', async () => {
      expect(
        await service.insertFileAssetsForTxnCreation(mockInsertFileAssetsForTxnCreationTxnCreationFileAssetInsert, mockEntityManager),
      ).toEqual({
        result: mockInsertFileAssetsForTxnCreationInsertFileAssetsResult,
        uuids: [mockInsertFileAssetsForTxnCreationFileAsset.uuid],
      });
    });

    it('should build and insert file assets', async () => {
      const {
        fileInfo: { name, expiry, deleteAt, checksum, metadata },
        ownerId,
        ownerMetadata,
        parentId,
        type,
        issuerId,
        oaCertificate,
      } = mockInsertFileAssetsForTxnCreationTxnCreationFileAssetInsert[0];
      const mergedMetadata = { ...metadata, ...ownerMetadata };

      await service.insertFileAssetsForTxnCreation(mockInsertFileAssetsForTxnCreationTxnCreationFileAssetInsert, mockEntityManager);

      expect(mockFileAssetEntityService.buildFileAsset).toBeCalledWith({
        documentType: FILE_TYPE.UNKNOWN,
        status: FILE_STATUS.INIT,
        size: -1,
        metadata: Object.keys(mergedMetadata).length === 0 ? null : mergedMetadata,

        name,
        ownerId,
        type,
        parentId,
        expireAt: expiry ? new Date(expiry) : null,
        deleteAt: deleteAt ? new Date(deleteAt) : null,
        documentHash: checksum,
        issuerId,
        oaCertificate,
        lastViewedAt: null,
      });

      expect(mockFileAssetEntityService.insertFileAssets).toBeCalledWith([mockInsertFileAssetsForTxnCreationFileAsset], mockEntityManager);
    });
  });

  describe('getOrCreateUser', () => {
    const {
      transaction: { recipients },
    } = mockCreateFileTransactionV2Request;

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should build and insert citizenUser if no existing user found with uin', async () => {
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(null);
      mockCitizenUserEntityService.buildCitizenUser.mockReturnValueOnce(mockCitizenUser);
      mockCitizenUserEntityService.insertCitizenUsers.mockResolvedValueOnce(mockInsertCitizenUsersResult);

      await service.getOrCreateUser(recipients);

      recipients.forEach((recipient) =>
        expect(mockCitizenUserEntityService.buildCitizenUser).toBeCalledWith({ uin: recipient.uin, status: STATUS.ACTIVE }),
      );
      expect(mockCitizenUserEntityService.insertCitizenUsers).toBeCalledWith([mockCitizenUser], undefined);
    });

    it('should not build and insert citizenUser if existing user found with uin', async () => {
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockCitizenUser);

      await service.getOrCreateUser(recipients);

      expect(mockCitizenUserEntityService.buildCitizenUser).toBeCalledTimes(0);
      expect(mockCitizenUserEntityService.insertCitizenUsers).toBeCalledTimes(0);
    });
  });

  describe('createReceiveTransferActivitiesAndFilesForUsers', () => {
    beforeEach(() => {
      mockActivityEntityService.buildActivity.mockReturnValue(mockReceiveTransferActivity);
      mockActivityEntityService.insertActivities.mockResolvedValueOnce(mockInsertReceiveTransferActivitiesResults);
      mockFileAssetEntityService.buildFileAsset.mockReturnValueOnce(mockTransferredFileAsset);
      mockFileAssetEntityService.insertFileAssets.mockResolvedValueOnce(mockInsertTransferredFileAssetsResult);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return correct values based on argument', async () => {
      expect(
        await service.createReceiveTransferActivitiesAndFilesForUsers(
          mockExistingUsers,
          mockTransaction,
          mockSendTransferActivity,
          mockCreateFileTransactionV2Request.files,
          mockProgrammaticUser.id,
          mockUploadAndSendTransferFileAssetIds,
          mockCreateFileTransactionV2Request.transaction.isAcknowledgementRequired,
          mockAcknowledgementTemplate.id,
          false,
          mockEntityManager,
        ),
      ).toEqual({
        receiveTransferFileAssetIds: mockReceiveTransferFileAssetIds,
        fileAssetModels: mockTransferredTxnCreationFileAssetInsert,
        recipients: mockCreateFileTransactionRecipientResponse,
      });
    });

    it('should call handler functions with correct values', async () => {
      const { name, dob, contact, email } = mockExistingUsers[mockCitizenUser.id];
      const mockReciepientInfo: ActivityRecipientInfo = {
        name,
        ...(email && { email }),
        ...(contact && dob && { mobile: contact, dob, failedAttempts: 0 }),
      };

      const insertFileAssetsForTxnCreationSpy = jest.spyOn(service, 'insertFileAssetsForTxnCreation');

      await service.createReceiveTransferActivitiesAndFilesForUsers(
        mockExistingUsers,
        mockTransaction,
        mockSendTransferActivity,
        mockCreateFileTransactionV2Request.files,
        mockProgrammaticUser.id,
        mockUploadAndSendTransferFileAssetIds,
        mockCreateFileTransactionV2Request.transaction.isAcknowledgementRequired,
        mockAcknowledgementTemplate.id,
        false,
        mockEntityManager,
      );

      expect(mockActivityEntityService.buildActivity).toBeCalledWith({
        status: ACTIVITY_STATUS.INIT,
        type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
        transaction: mockTransaction,
        parent: mockSendTransferActivity,
        recipientInfo: mockReciepientInfo,
        userId: mockCitizenUser.id,
        isAcknowledgementRequired: mockCreateFileTransactionV2Request.transaction.isAcknowledgementRequired,
        acknowledgementTemplateId: mockAcknowledgementTemplate.id,
      });

      expect(mockActivityEntityService.insertActivities).toBeCalledWith([mockReceiveTransferActivity], mockEntityManager);

      expect(insertFileAssetsForTxnCreationSpy).toBeCalledWith(mockTransferredTxnCreationFileAssetInsert, mockEntityManager);

      expect(mockActivityEntityService.insertActivityFiles).toBeCalledWith(receiveTransferActivityFileInserts, mockEntityManager);
    });
  });

  describe('generateFileUploadInfo', () => {
    it('should transform and return the correct values', async () => {
      const userAgency = mockProgrammaticUser.eservices![0].agency!;
      const { name, code, identityProofLocation, oaSigningKey } = userAgency;

      expect(await service.generateFileUploadInfo(mockProgrammaticUser, mockTransactionInfo)).toEqual({
        userUuid: mockProgrammaticUser.uuid,
        agencyInfo: {
          name,
          code,
          identityProofLocation,
          sk: oaSigningKey,
        },
        transactionInfo: mockTransactionInfo,
      });
    });
  });

  describe('generateFileUploadJwt', () => {
    it('should call generateJWT with correct values', async () => {
      const mockTransactionUuid = 'mockTransactionUuid-1';

      await service.generateFileUploadJwt(mockTransactionUuid);

      expect(mockAuthService.generateJWT).toBeCalledWith({ transactionUuid: mockTransactionUuid }, JWT_TYPE.FILE_UPLOAD, {
        expiresIn: mockFileSGConfigService.authConfig.jwtAccessTokenExpirationDuration,
      });
    });
  });
});
