/* eslint-disable sonarjs/no-duplicate-string */
import {
  FORMSG_PROCESS_FAIL_TYPE,
  FORMSG_TRANSACTION_FAIL_TYPE,
  FormSgIssuanceFailureMessage,
  FormSgIssuanceFailureMessagePayload,
  FormSgIssuanceMessageBasePayload,
  FormSgIssuanceSuccessMessage,
  FormSgIssuanceSuccessMessagePayload,
  RESULT_STATUS,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EVENT, FORMSG_FAIL_CATEGORY, NOTIFICATION_CHANNEL } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UnknownAgencyFileAssetsException } from '../../../../common/filters/custom-exceptions.filter';
import {
  AgencyFileAsset,
  EmailNotificationInfo,
  FormSgTransaction,
  FormSgTransactionUpdateModel,
  SgNotifyNotificationInfo,
} from '../../../../entities/formsg-transaction';
import { mockFormSgTransactionEntityService } from '../../../entities/formsg-transaction/__mocks__/formsg-transaction.entity.mock';
import { FormSgTransactionEntityService } from '../../../entities/formsg-transaction/formsg-transaction.entity.service';
import { mockSqsService } from '../../aws/__mocks__/sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import {
  formSgBatchProcessCompleteEvent,
  formSgProcessAuthDecryptFailureEvent,
  formSgProcessCreateTxnFailureEvent,
  formSgProcessFileUploadFailureEvent,
  formSgProcessInitEvent,
  formSgProcessSuccessEvent,
  formSgProcessUpdateEvent,
  formSgRecipientNotificationDeliveryFailureEvent,
  formSgRecipientNotificationDeliverySuccessEvent,
  formSgTransactionOthersFailureEvent,
  formSgTransactionSuccessEvent,
  formSgTransactionVirusScanFailureEvent,
  mockAgencyFileAssets,
  mockAgencyFileAssetUuid1,
  mockAgencyFileAssetUuid2,
  mockApplication,
  mockBatchId,
  mockBatchSize,
  mockFormSgBatchHeader,
  mockFormSgProcessCreateTxnFailureTransaction,
  mockFormSgTransaction,
  mockId,
  mockMaskedUin1,
  mockNotificationDeliveryFailedReason,
  mockNotificationDeliveryFailSubType,
  mockNotificationsToSendCount,
  mockProcessAuthDecryptError,
  mockProcessCreateTxnError,
  mockProcessedTransactionCount,
  mockProcessFileUploadError,
  mockRecipientActivityUuid1,
  mockRequestorEmail,
  mockTimestamp,
  mockTransaction,
  mockTransactionFailSubType,
  mockTransactionOthersError,
  mockTransactionUuid,
  mockTransactionVirusScanError,
  mockTransactionVirusScanFailSubType,
  mockVirusAgencyFileAssetUuid,
  TestFormSgTransactionService,
} from '../__mocks__/formsg-transaction.service.mock';

describe('FormSgTransactionService', () => {
  let service: TestFormSgTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFormSgTransactionService,
        { provide: FormSgTransactionEntityService, useValue: mockFormSgTransactionEntityService },
        { provide: SqsService, useValue: mockSqsService },
      ],
    }).compile();

    service = module.get<TestFormSgTransactionService>(TestFormSgTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleProcessInit', () => {
    it('should call methods with the right params', async () => {
      await service.handleProcessInit(formSgProcessInitEvent);

      expect(mockFormSgTransactionEntityService.createFormSgTransaction).toBeCalledWith({
        id: mockId,
        queueEventTimestamp: mockTimestamp,
        processorStartedTimestamp: mockTimestamp,
        processes: [],
        batchId: undefined,
      });
    });
  });

  describe('handleProcessUpdate', () => {
    it('should call methods with the right params', async () => {
      await service.handleProcessUpdate(formSgProcessUpdateEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith(
        { id: mockId },
        {
          $SET: {
            requestorEmail: mockRequestorEmail,
            batchSize: mockBatchSize,
            processedTransactionCount: 0,
            failedTransactionCount: 0,
            failedNotificationCount: 0,
          },
        },
      );
    });
  });

  describe('handleBatchProcessComplete', () => {
    it('should call methods with the right params', async () => {
      await service.handleBatchProcessComplete(formSgBatchProcessCompleteEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith(
        { id: mockId },
        {
          $SET: {
            processorEndedTimestamp: mockTimestamp,
          },
          $ADD: { processes: [{ timestamp: mockTimestamp, result: RESULT_STATUS.SUCCESS }] },
        },
      );
    });
  });

  describe('handleProcessSuccess', () => {
    it('should call methods with the right params', async () => {
      await service.handleProcessSuccess(formSgProcessSuccessEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith(
        { id: mockId },
        {
          $SET: {
            processorEndedTimestamp: mockTimestamp,
            requestorEmail: mockRequestorEmail,
            application: mockApplication,
            transaction: mockTransaction,
            transactionUuid: mockTransactionUuid,
            notificationsSent: [],
            notificationsToSendCount: mockNotificationsToSendCount,
          },
          $ADD: { processes: [{ timestamp: mockTimestamp, result: RESULT_STATUS.SUCCESS }] },
        },
      );
    });
  });

  describe('handleProcessFailure', () => {
    let sendIssuanceFailureMessageToQueueCoreEventsSpy: jest.SpyInstance;
    let validateAndHandleFailureTxnCompletionSpy: jest.SpyInstance;

    beforeEach(() => {
      mockFormSgTransactionEntityService.updateFormSgTransaction.mockResolvedValueOnce(mockFormSgTransaction);
      sendIssuanceFailureMessageToQueueCoreEventsSpy = jest.spyOn(service, 'sendIssuanceFailureMessageToQueueCoreEvents');

      validateAndHandleFailureTxnCompletionSpy = jest.spyOn(service, 'validateAndHandleFailureTxnCompletion');
    });

    afterEach(() => {
      expect(validateAndHandleFailureTxnCompletionSpy).toBeCalledWith(mockFormSgTransaction);
    });

    it('should call methods with the right params when failure is of type formsg-process-auth-decrypt', async () => {
      const updates: FormSgTransactionUpdateModel = {
        processorEndedTimestamp: mockTimestamp,
        result: RESULT_STATUS.FAILURE,
        failedReason: mockProcessAuthDecryptError,
        failType: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
      };

      await service.handleProcessFailure(formSgProcessAuthDecryptFailureEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith(
        { id: mockId },
        {
          $SET: updates,
          $ADD: {
            processes: [{ timestamp: mockTimestamp, result: RESULT_STATUS.FAILURE, failedReason: mockProcessAuthDecryptError }],
          },
        },
      );
      expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).toBeCalledWith(service.generateIssuanceMessagePayload(mockFormSgTransaction));
    });

    it('should call methods with the right params when failure is of type formsg-process-create-txn', async () => {
      const updates: FormSgTransactionUpdateModel = {
        processorEndedTimestamp: mockTimestamp,
        result: RESULT_STATUS.FAILURE,
        failedReason: mockProcessCreateTxnError,
        failType: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN,
        requestorEmail: mockRequestorEmail,
        application: mockApplication,
        transaction: mockFormSgProcessCreateTxnFailureTransaction,
      };

      await service.handleProcessFailure(formSgProcessCreateTxnFailureEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith(
        { id: mockId },
        {
          $SET: updates,
          $ADD: {
            processes: [{ timestamp: mockTimestamp, result: RESULT_STATUS.FAILURE, failedReason: mockProcessCreateTxnError }],
          },
        },
      );
      expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).toBeCalledWith(service.generateIssuanceMessagePayload(mockFormSgTransaction));
    });

    it('should call methods with the right params when failure is of type formsg-process-file-upload', async () => {
      const updates: FormSgTransactionUpdateModel = {
        processorEndedTimestamp: mockTimestamp,
        result: RESULT_STATUS.FAILURE,
        failedReason: mockProcessFileUploadError,
        failType: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD,
        requestorEmail: mockRequestorEmail,
        application: mockApplication,
        transaction: mockTransaction,
        transactionUuid: mockTransactionUuid,
      };

      await service.handleProcessFailure(formSgProcessFileUploadFailureEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith(
        { id: mockId },
        {
          $SET: updates,
          $ADD: {
            processes: [{ timestamp: mockTimestamp, result: RESULT_STATUS.FAILURE, failedReason: mockProcessFileUploadError }],
          },
        },
      );
      expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).toBeCalledWith(service.generateIssuanceMessagePayload(mockFormSgTransaction));
    });
  });

  describe('handleTransactionSuccess', () => {
    it('should call methods with the right params', async () => {
      await service.handleTransactionSuccess(formSgTransactionSuccessEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransactionByTransactionUuid).toBeCalledWith(mockTransactionUuid, {
        result: RESULT_STATUS.SUCCESS,
      });
    });
  });

  describe('handleTransactionFailure', () => {
    let sendIssuanceFailureMessageToQueueCoreEventsSpy: jest.SpyInstance;
    let validateAndHandleFailureTxnCompletionSpy: jest.SpyInstance;

    beforeEach(() => {
      mockFormSgTransactionEntityService.updateFormSgTransaction.mockResolvedValueOnce(mockFormSgTransaction);
      sendIssuanceFailureMessageToQueueCoreEventsSpy = jest.spyOn(service, 'sendIssuanceFailureMessageToQueueCoreEvents');

      validateAndHandleFailureTxnCompletionSpy = jest.spyOn(service, 'validateAndHandleFailureTxnCompletion');
    });

    afterEach(() => {
      expect(validateAndHandleFailureTxnCompletionSpy).toBeCalledWith(mockFormSgTransaction);
    });

    it('should call methods with the right params when failure is of type formsg-transaction-others', async () => {
      const updates: FormSgTransactionUpdateModel = {
        result: RESULT_STATUS.FAILURE,
        failType: FORMSG_TRANSACTION_FAIL_TYPE.OTHERS,
        failSubType: mockTransactionFailSubType,
        failedReason: mockTransactionOthersError,
      };

      mockFormSgTransactionEntityService.findFormSgTransactionsByTransactionUuid.mockResolvedValueOnce([mockFormSgTransaction]);

      await service.handleTransactionFailure(formSgTransactionOthersFailureEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith({ id: mockId }, updates);
      expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).toBeCalledWith(service.generateIssuanceMessagePayload(mockFormSgTransaction));
    });

    it('should call methods with the right params when failure is of type formsg-transaction-virus-scan', async () => {
      const newAgencyFileAssets: AgencyFileAsset[] = [...mockAgencyFileAssets];
      newAgencyFileAssets[0].failedReason = mockTransactionVirusScanError;
      newAgencyFileAssets[0].failSubType = FORMSG_FAIL_CATEGORY.FILE_CONTAINS_VIRUS;
      newAgencyFileAssets[1].failedReason = undefined;
      newAgencyFileAssets[1].failedReason = undefined;

      const updates: FormSgTransactionUpdateModel = {
        result: RESULT_STATUS.FAILURE,
        failType: FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN,
        failSubType: mockTransactionVirusScanFailSubType,
        failedReason: mockTransactionVirusScanError,
        transaction: { ...mockTransaction, agencyFileAssets: newAgencyFileAssets },
      };

      mockFormSgTransactionEntityService.findFormSgTransactionsByTransactionUuid.mockResolvedValueOnce([mockFormSgTransaction]);
      const validateAgencyFileAssetUuidsSpy = jest.spyOn(service, 'validateAgencyFileAssetUuids');

      await service.handleTransactionFailure(formSgTransactionVirusScanFailureEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith({ id: mockId }, updates);
      expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).toBeCalledWith(service.generateIssuanceMessagePayload(mockFormSgTransaction));
      expect(validateAgencyFileAssetUuidsSpy).toBeCalledWith(
        [mockVirusAgencyFileAssetUuid],
        [mockAgencyFileAssetUuid1, mockAgencyFileAssetUuid2],
        mockTransactionUuid,
      );
    });
  });

  describe('handleRecipientNotificationDelivery', () => {
    const updates = {
      recipientActivityUuid: mockRecipientActivityUuid1,
      maskedUin: mockMaskedUin1,
      channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
    };

    it('should add new notification sent with status success to array when event is of type success', async () => {
      mockFormSgTransactionEntityService.updateFormSgTransactionByTransactionUuid.mockResolvedValueOnce(mockFormSgTransaction);

      await service.handleRecipientNotificationDelivery(formSgRecipientNotificationDeliverySuccessEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransactionByTransactionUuid).toBeCalledWith(mockTransactionUuid, {
        $ADD: {
          notificationsSent: [
            {
              ...updates,
              status: RESULT_STATUS.SUCCESS,
            },
          ],
        },
      });
    });

    it('should add new notification sent with status failure to array when event is of type failure', async () => {
      mockFormSgTransactionEntityService.updateFormSgTransactionByTransactionUuid.mockResolvedValueOnce(mockFormSgTransaction);

      await service.handleRecipientNotificationDelivery(formSgRecipientNotificationDeliveryFailureEvent);

      expect(mockFormSgTransactionEntityService.updateFormSgTransactionByTransactionUuid).toBeCalledWith(mockTransactionUuid, {
        $ADD: {
          notificationsSent: [
            {
              ...updates,
              failSubType: mockNotificationDeliveryFailSubType,
              failedReason: mockNotificationDeliveryFailedReason,
              status: RESULT_STATUS.FAILURE,
            },
          ],
        },
      });
    });

    it('should send success message to queue core events when notification send length equals to expected send count', async () => {
      const mockNotificationsSent: (EmailNotificationInfo | SgNotifyNotificationInfo)[] = [
        {
          channel: NOTIFICATION_CHANNEL.EMAIL,
          status: RESULT_STATUS.SUCCESS,
          email: 'mock@gmail.com',
          maskedUin: mockMaskedUin1,
          recipientActivityUuid: mockRecipientActivityUuid1,
        },
      ];
      const mockFormSgTxn = { ...mockFormSgTransaction, notificationsToSendCount: 1, notificationsSent: mockNotificationsSent };

      mockFormSgTransaction.notificationsSent = mockNotificationsSent;

      const sendIssuanceSuccessMessageToQueueCoreEventsSpy = jest.spyOn(service, 'sendIssuanceSuccessMessageToQueueCoreEvents');

      mockFormSgTransactionEntityService.updateFormSgTransactionByTransactionUuid.mockResolvedValueOnce(mockFormSgTxn);

      await service.handleRecipientNotificationDelivery(formSgRecipientNotificationDeliveryFailureEvent);

      expect(sendIssuanceSuccessMessageToQueueCoreEventsSpy).toBeCalledWith(service.generateIssuanceMessagePayload(mockFormSgTxn));
    });
  });

  describe('generateIssuanceMessagePayload', () => {
    it('should return success message payload when formsg transaction succeed', () => {
      const mockSuccessFormSgTransaction: FormSgTransaction = {
        ...mockFormSgTransaction,
        transaction: { ...mockTransaction },
      };

      const messagePayload = service.generateIssuanceMessagePayload(mockSuccessFormSgTransaction);

      const { agencyFileAssets, recipientActivities } = mockTransaction;

      expect(messagePayload).not.toHaveProperty('failType');
      expect(messagePayload).toHaveProperty('transaction', {
        applicationType: mockApplication.type,
        uuid: mockTransaction.uuid,
        name: mockTransaction.name,
        fileNames: agencyFileAssets.map((file) => file.name),
        recipientNames: recipientActivities.map((activity) => activity.name),
      });
    });

    it('should return failure message payload with failType when formsg transaction failed', () => {
      const mockFailureFormSgTransaction: FormSgTransaction = {
        ...mockFormSgTransaction,
        failType: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
        transaction: { ...mockTransaction, uuid: undefined },
      };

      const messagePayload = service.generateIssuanceMessagePayload(mockFailureFormSgTransaction);

      const { agencyFileAssets, recipientActivities } = mockTransaction;

      expect(messagePayload).toHaveProperty('failType', FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT);
      expect(messagePayload).toHaveProperty('transaction', {
        applicationType: mockApplication.type,
        name: mockTransaction.name,
        fileNames: agencyFileAssets.map((file) => file.name),
        recipientNames: recipientActivities.map((activity) => activity.name),
      });
    });
  });

  describe('generateBatchIssuanceMessagePayload', () => {
    const base: FormSgIssuanceMessageBasePayload = {
      issuanceId: mockId,
      requestorEmail: mockRequestorEmail,
      queueEventTimestamp: mockTimestamp,
    };

    it('should generate process failure message payload when batch header has failType', () => {
      const mockBatchHeaderWithFailType = {
        ...mockFormSgBatchHeader,
        failType: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION,
        failSubType: 'some batch csv parsing error',
      };

      expect(service.generateBatchIssuanceMessagePayload(mockBatchHeaderWithFailType)).toEqual({
        ...base,
        failType: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION,
        failSubType: 'some batch csv parsing error',
      });
    });

    it('should generate transaction failure message payload when batch header has failedTransactionCount > 0', () => {
      const mockBatchHeaderWithFailedTransaction = {
        ...mockFormSgBatchHeader,
        failedTransactionCount: 1,
      };

      expect(service.generateBatchIssuanceMessagePayload(mockBatchHeaderWithFailedTransaction)).toEqual({
        ...base,
        batchSize: mockBatchSize,
        failedTransactionCount: 1,
        hasNotificationToRecipientFailure: false,
      });
    });

    it('should generate success message payload when batch header has no failType or failedTransactionCount > 0', () => {
      expect(service.generateBatchIssuanceMessagePayload(mockFormSgBatchHeader)).toEqual({
        ...base,
        hasNotificationToRecipientFailure: false,
      });
    });
  });

  describe('sendIssuanceSuccessMessageToQueueCoreEvents', () => {
    it('should call method with the right params', async () => {
      const mockSuccessFormSgTransaction: FormSgTransaction = {
        ...mockFormSgTransaction,
        transaction: { ...mockTransaction },
      };
      const messagePayload = service.generateIssuanceMessagePayload(mockSuccessFormSgTransaction) as FormSgIssuanceSuccessMessagePayload;

      const message: FormSgIssuanceSuccessMessage = {
        event: EVENT.FORMSG_ISSUANCE_SUCCESS,
        payload: messagePayload,
      };

      await service.sendIssuanceSuccessMessageToQueueCoreEvents(messagePayload);

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(message);
    });
  });

  describe('sendIssuanceFailureMessageToQueueCoreEvents', () => {
    it('should call method with the right params', async () => {
      const mockFailureFormSgTransaction: FormSgTransaction = {
        ...mockFormSgTransaction,
        failType: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
        transaction: { ...mockTransaction, uuid: undefined },
      };

      const messagePayload = service.generateIssuanceMessagePayload(mockFailureFormSgTransaction) as FormSgIssuanceFailureMessagePayload;

      const message: FormSgIssuanceFailureMessage = {
        event: EVENT.FORMSG_ISSUANCE_FAILURE,
        payload: messagePayload,
      };

      await service.sendIssuanceFailureMessageToQueueCoreEvents(messagePayload);

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(message);
    });
  });

  describe('validateAgencyFileAssetUuids', () => {
    it('should throw error when the file asset uuids from request is not part of the transaction', async () => {
      const mockNewFileAssetUuids = ['new-file-asset-uuid-1'];
      const mockExistingFileAssetUuids = ['existing-file-asset-uuid-1'];

      await expect(
        service.validateAgencyFileAssetUuids(mockNewFileAssetUuids, mockExistingFileAssetUuids, mockTransactionUuid),
      ).rejects.toThrowError(
        new UnknownAgencyFileAssetsException(COMPONENT_ERROR_CODE.FORMSG_SERVICE, mockTransactionUuid!, mockNewFileAssetUuids),
      );
    });
  });

  describe('validateAndHandleFailureTxnCompletion', () => {
    let sendIssuanceFailureMessageToQueueCoreEventsSpy: jest.SpyInstance;
    let generateIssuanceMessagePayloadSpy: jest.SpyInstance;
    let generateBatchIssuanceMessagePayloadSpy: jest.SpyInstance;

    beforeEach(() => {
      sendIssuanceFailureMessageToQueueCoreEventsSpy = jest.spyOn(service, 'sendIssuanceFailureMessageToQueueCoreEvents');
      generateIssuanceMessagePayloadSpy = jest.spyOn(service, 'generateIssuanceMessagePayload');
      generateBatchIssuanceMessagePayloadSpy = jest.spyOn(service, 'generateBatchIssuanceMessagePayload');
    });

    it('should call methods with right params when transaction is not part of a batch', async () => {
      await service.validateAndHandleFailureTxnCompletion(mockFormSgTransaction);

      expect(generateIssuanceMessagePayloadSpy).toBeCalledWith(mockFormSgTransaction);
      expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).toBeCalledWith(service.generateIssuanceMessagePayload(mockFormSgTransaction));
    });

    describe('when transaction is part of a batch', () => {
      const mockFormSgTransactionWithBatchId = { ...mockFormSgTransaction, batchId: mockBatchId };

      afterEach(() => {
        expect(mockFormSgTransactionEntityService.updateFormSgTransaction).toBeCalledWith(
          { id: mockBatchId },
          { $ADD: { processedTransactionCount: 1, failedTransactionCount: 1 } },
        );
      });

      it('should call methods with right params', async () => {
        const mockFormSgBatchHeaderWithIncompleteTxn = {
          ...mockFormSgBatchHeader,
          processedTransactionCount: mockProcessedTransactionCount - 1,
        };

        mockFormSgTransactionEntityService.updateFormSgTransaction.mockResolvedValueOnce(mockFormSgBatchHeaderWithIncompleteTxn);

        await service.validateAndHandleFailureTxnCompletion(mockFormSgTransactionWithBatchId);

        expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).not.toBeCalled();
        expect(generateBatchIssuanceMessagePayloadSpy).not.toBeCalled();
      });

      it('should only send message to service core when batchSize equals to processedTransactionCount', async () => {
        mockFormSgTransactionEntityService.updateFormSgTransaction.mockResolvedValueOnce(mockFormSgBatchHeader);

        await service.validateAndHandleFailureTxnCompletion(mockFormSgTransactionWithBatchId);

        expect(generateBatchIssuanceMessagePayloadSpy).toBeCalledWith(mockFormSgBatchHeader);
        expect(sendIssuanceFailureMessageToQueueCoreEventsSpy).toBeCalledWith(
          service.generateBatchIssuanceMessagePayload(mockFormSgBatchHeader),
        );
      });
    });
  });
});
