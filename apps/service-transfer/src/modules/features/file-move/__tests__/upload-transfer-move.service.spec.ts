import { FailedMove, MoveFilesFailureException } from '@filesg/aws';
import {
  MoveFailedMessageTransfer,
  TransferMoveCompletedMessage,
  TransferMoveFailedMessage,
  UnknownFileSessionTypeException,
  UploadMoveCompletedMessage,
  UploadMoveFailedMessage,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EVENT, FILE_TYPE, FileTransfer, TransferFile } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockCredentials, mockS3Client, mockS3Service } from '../../aws/__mocks__/aws-s3.service.mock';
import { mockSqsService } from '../../aws/__mocks__/aws-sqs.service.mock';
import { mockStsService } from '../../aws/__mocks__/aws-sts.service.mock';
import { CopyTransferFilesEncrypted, S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { StsService } from '../../aws/sts.service';
import {
  mockEncryptedPassword,
  mockFailureTransferInfo,
  mockFileAssetUuidToNewSizeMap,
  mockNewFileName,
  mockTransferInfoWithoutTransferFiles,
  mockTransferMoveTransferInfo,
  mockUploadMoveTransferInfo,
  mockUploadMoveTransferInfoWithEncryptedFiles,
  TestUploadAndTransferMoveService,
} from '../__mocks__/upload-transfer-move.service.mock';

const getFailedMove = (failedFile: TransferFile): FailedMove => ({
  reason: 'testError',
  fromKey: failedFile.from.key,
  toKey: failedFile.to.key,
  isRetryable: true,
});

const getMoveFailedMessageTransfer = (
  transfer: FileTransfer,
  transferFile: TransferFile,
  failedMove: FailedMove,
): MoveFailedMessageTransfer => {
  return {
    activityId: transfer.activityId,
    files: [
      {
        id: transferFile.to.fileAssetUuid,
        error: failedMove.reason,
      },
    ],
  };
};

const getFilesToBeRemoved = (transfers: FileTransfer[]): string[] => {
  return [
    ...new Set(
      transfers.reduce<string[]>((result, item) => {
        item.files.forEach((file) => result.push(file.from.key));
        return result;
      }, []),
    ),
  ];
};

describe('UploadAndTransferMoveService', () => {
  let service: TestUploadAndTransferMoveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestUploadAndTransferMoveService,
        { provide: SqsService, useValue: mockSqsService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: StsService, useValue: mockStsService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    service = module.get<TestUploadAndTransferMoveService>(TestUploadAndTransferMoveService);

    jest.clearAllMocks();
    mockStsService.assumeMoveRole.mockResolvedValue(mockCredentials);
    mockS3Service.createAssumedClient.mockResolvedValue(mockS3Client);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleUploadAndTransferMove', () => {
    it('should fail if file session type is neither type upload or transfer', async () => {
      await expect(service.handleUploadAndTransferMove(mockFailureTransferInfo, 3)).rejects.toThrow(UnknownFileSessionTypeException);
    });

    it('should call handleMoveTransfer with the correct args', async () => {
      const { fileSession, transaction, transfers } = mockTransferMoveTransferInfo;

      const handleMoveTransferSpy = jest.spyOn(service, 'handleMoveTransfer');
      const deleteAllFilesFromBucketSpy = jest.spyOn(service, 'deleteAllFilesFromBucket');
      const sendTransferMoveCompletedMessageSpy = jest.spyOn(service, 'sendTransferMoveCompletedMessage');

      await service.handleUploadAndTransferMove(mockTransferMoveTransferInfo, 1);

      expect(handleMoveTransferSpy).toBeCalledWith(mockTransferMoveTransferInfo);
      expect(deleteAllFilesFromBucketSpy).not.toBeCalled();
      expect(sendTransferMoveCompletedMessageSpy).toBeCalledWith(fileSession, transaction, transfers);
    });

    it('should call deleteAllFilesFromBucket and sendUploadMoveCompletedMessage with the correct args when file session is of type upload without encrypted files', async () => {
      const { fileSession, transaction, transfers } = mockUploadMoveTransferInfo;
      const fileSessionType = fileSession.type;

      const handleMoveTransferSpy = jest.spyOn(service, 'handleMoveTransfer');
      handleMoveTransferSpy.mockResolvedValueOnce([{ status: 'fulfilled', value: undefined }]);

      const deleteAllFilesFromBucketSpy = jest.spyOn(service, 'deleteAllFilesFromBucket');
      const sendUploadMoveCompletedMessageSpy = jest.spyOn(service, 'sendUploadMoveCompletedMessage');

      await service.handleUploadAndTransferMove(mockUploadMoveTransferInfo, 1);

      expect(handleMoveTransferSpy).toBeCalledWith(mockUploadMoveTransferInfo);
      expect(deleteAllFilesFromBucketSpy).toBeCalledWith(fileSessionType, transfers);
      expect(sendUploadMoveCompletedMessageSpy).toBeCalledWith(fileSession, transaction, transfers);
    });

    it('should call sendUploadMoveCompletedMessage with the correct args when file session is of type upload with encrypted files', async () => {
      const { fileSession, transaction, transfers } = mockUploadMoveTransferInfoWithEncryptedFiles;
      const fileSessionType = fileSession.type;

      const handleMoveTransferSpy = jest.spyOn(service, 'handleMoveTransfer');
      handleMoveTransferSpy.mockResolvedValueOnce([
        {
          status: 'fulfilled',
          value: { encryptedPassword: mockEncryptedPassword, fileAssetUuidToNewSizeMap: mockFileAssetUuidToNewSizeMap },
        },
      ]);

      const deleteAllFilesFromBucketSpy = jest.spyOn(service, 'deleteAllFilesFromBucket');
      const sendUploadMoveCompletedMessageSpy = jest.spyOn(service, 'sendUploadMoveCompletedMessage');

      await service.handleUploadAndTransferMove(mockUploadMoveTransferInfoWithEncryptedFiles, 1);

      expect(handleMoveTransferSpy).toBeCalledWith(mockUploadMoveTransferInfoWithEncryptedFiles);
      expect(deleteAllFilesFromBucketSpy).toBeCalledWith(fileSessionType, transfers);
      expect(sendUploadMoveCompletedMessageSpy).toBeCalledWith(
        fileSession,
        transaction,
        transfers,
        mockEncryptedPassword,
        mockFileAssetUuidToNewSizeMap,
      );
    });

    it('should call handleFailedMoveException when error is of type MoveFilesFailureException and message approximateReceiveCount exceeds the max', async () => {
      const { transfers } = mockUploadMoveTransferInfo;
      const failedMoves = [getFailedMove(transfers[0].files[0])];

      const handleMoveTransferSpy = jest.spyOn(service, 'handleMoveTransfer');
      handleMoveTransferSpy.mockRejectedValueOnce(
        new MoveFilesFailureException(COMPONENT_ERROR_CODE.UPLOAD_TRANSFER_MOVE_SERVICE, failedMoves),
      );

      const sendUploadMoveCompletedMessageSpy = jest.spyOn(service, 'sendUploadMoveCompletedMessage');
      const handleFailedMoveExceptionSpy = jest.spyOn(service, 'handleFailedMoveException');

      await expect(service.handleUploadAndTransferMove(mockUploadMoveTransferInfo, 3)).rejects.toThrow(MoveFilesFailureException);

      expect(sendUploadMoveCompletedMessageSpy).not.toBeCalled();
      expect(handleFailedMoveExceptionSpy).toBeCalledWith(failedMoves, mockUploadMoveTransferInfo, 'Message failed processing 3 times.');
    });
  });

  describe('handleMoveTransfer', () => {
    it('should call copyTransferFiles with the correct args when transfer files length is more than 0', async () => {
      const { fromBucket, toBucket, transfers } = mockUploadMoveTransferInfo;

      const validateMovePromiseResultsSpy = jest.spyOn(service, 'validateMovePromiseResults');

      await service.handleMoveTransfer(mockUploadMoveTransferInfo);

      transfers.forEach(({ files, assumeRole }) => {
        if (files.length > 0) {
          expect(mockS3Service.copyTransferFiles).toBeCalledWith(files, fromBucket, toBucket, mockS3Client, assumeRole);
        }
      });

      expect(validateMovePromiseResultsSpy).toBeCalledTimes(1);
    });

    it('should not call copyTransferFiles when there is no transfer file', async () => {
      const validateMovePromiseResultsSpy = jest.spyOn(service, 'validateMovePromiseResults');

      await service.handleMoveTransfer(mockTransferInfoWithoutTransferFiles);

      expect(mockS3Service.copyTransferFiles).not.toBeCalled();
      expect(validateMovePromiseResultsSpy).toBeCalledTimes(1);
    });
  });

  describe('validateMovePromiseResults', () => {
    it('should not throw any error if there is no rejection in the promise results', async () => {
      const movePromiseResults: PromiseSettledResult<CopyTransferFilesEncrypted | undefined>[] = [
        { status: 'fulfilled', value: undefined },
      ];

      expect(service.validateMovePromiseResults(movePromiseResults, mockUploadMoveTransferInfo)).resolves.toBe(undefined);
    });

    it('should throw Error when there are errors other than failed move errors', async () => {
      const rejectionErrorMessages = ['some-other-error-message'];

      const movePromiseResults: PromiseSettledResult<CopyTransferFilesEncrypted | undefined>[] = [
        { status: 'rejected', reason: { message: rejectionErrorMessages[0] } },
      ];

      await expect(service.validateMovePromiseResults(movePromiseResults, mockUploadMoveTransferInfo)).rejects.toThrowError(
        rejectionErrorMessages.join(', '),
      );
    });

    it('should call validateMoveTransfer with the correct params and throw MoveFilesFailureException when there are failed moves', async () => {
      const {
        fileSession: { type: fileSessionType },
        transfers,
      } = mockUploadMoveTransferInfo;

      const transferFilesToFail = transfers[0].files[0];

      const failedMoves = [getFailedMove(transferFilesToFail)];
      const movePromiseResults: PromiseSettledResult<CopyTransferFilesEncrypted | undefined>[] = [
        { status: 'rejected', reason: { failedMoves } },
      ];

      const failedFileAssetUuids = [transferFilesToFail.to.fileAssetUuid];

      const validateMoveTransferSpy = jest.spyOn(service, 'validateMoveTransfer');

      await expect(service.validateMovePromiseResults(movePromiseResults, mockUploadMoveTransferInfo)).rejects.toThrow(
        MoveFilesFailureException,
      );

      transfers.forEach((transfer) => expect(validateMoveTransferSpy).toBeCalledWith(fileSessionType, transfer, failedFileAssetUuids));
    });
  });

  describe('validateMoveTransfer', () => {
    it('should call deleteFilesAllVersionsFromMainBucket when there is transfer with files that are not deleted/handled in the previous method erorr handling', async () => {
      const {
        fileSession: { type: fileSessionType },
        transfers,
      } = mockUploadMoveTransferInfo;

      const transfer = transfers[0];
      const keysToDelete = transfer.files.map((file) => file.to.key);

      // assuming these are those failed previous and deleted
      const failedFileAssetUuids = ['fileAsset-uuid-3', 'fileAsset-uuid-4'];

      await service.validateMoveTransfer(fileSessionType, transfer, failedFileAssetUuids);

      expect(mockS3Service.deleteFilesAllVersionsFromMainBucket).toBeCalledWith(keysToDelete, mockS3Client);
    });
  });

  describe('handleFailedMoveException', () => {
    it('should call sendMoveFailedMessage with the correct args and call deleteAllFilesFromBucket if transaction is not type of transfer', async () => {
      const { fileSession, transaction, transfers } = mockUploadMoveTransferInfo;

      const firstTransfer = transfers[0];
      const firstTransferFile = firstTransfer.files[0];
      const failedMove = getFailedMove(firstTransferFile);
      const resultTransfers = [getMoveFailedMessageTransfer(firstTransfer, firstTransferFile, failedMove)];

      const deleteAllFilesFromBucketSpy = jest.spyOn(service, 'deleteAllFilesFromBucket');
      const sendMoveFailedMessageSpy = jest.spyOn(service, 'sendMoveFailedMessage');

      await service.handleFailedMoveException([failedMove], mockUploadMoveTransferInfo);

      expect(deleteAllFilesFromBucketSpy).toBeCalledWith(fileSession.type, transfers);
      expect(sendMoveFailedMessageSpy).toBeCalledWith(fileSession, transaction, resultTransfers);
    });
  });

  describe('sendUploadMoveCompletedMessage', () => {
    it('should send success message with new transfer file details if the transfer file requires encryption', async () => {
      const { fileSession, transaction, transfers } = mockUploadMoveTransferInfoWithEncryptedFiles;

      const reconcileZipEncryptedFileNameSpy = jest.spyOn(service, 'reconcileZipEncryptedFileName');

      let numberOfFilesRequireEncryption = 0;
      transfers.forEach(({ files }) => files.forEach((file) => file.isPasswordEncryptionRequired && ++numberOfFilesRequireEncryption));

      const successMessage: UploadMoveCompletedMessage = {
        event: EVENT.FILES_UPLOAD_MOVE_COMPLETED,
        payload: {
          fileSession,
          transaction,
          transfers: transfers.map(({ activityId, files }) => ({
            activityId: activityId,
            files: files.map(({ to, isPasswordEncryptionRequired, name }) => {
              if (isPasswordEncryptionRequired && name) {
                return {
                  id: to.fileAssetUuid,
                  updates: {
                    name: mockNewFileName,
                    type: FILE_TYPE.ZIP,
                    size: mockFileAssetUuidToNewSizeMap[to.fileAssetUuid],
                    isPasswordEncrypted: isPasswordEncryptionRequired,
                  },
                };
              }

              return { id: to.fileAssetUuid };
            }),
            encryptedPassword: mockEncryptedPassword,
          })),
        },
      };

      await service.sendUploadMoveCompletedMessage(
        fileSession,
        transaction,
        transfers,
        mockEncryptedPassword,
        mockFileAssetUuidToNewSizeMap,
      );

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(successMessage);
      expect(reconcileZipEncryptedFileNameSpy).toBeCalledTimes(numberOfFilesRequireEncryption);
    });
  });

  describe('reconcileZipEncryptedFileName', () => {
    it('should append the correct extension (.zip), when no extension is given', () => {
      const nameWithoutExtension = 'nameWithoutExtension';
      expect(service.reconcileZipEncryptedFileName(nameWithoutExtension)).toBe(`${nameWithoutExtension}.${FILE_TYPE.ZIP}`);
    });

    it('should replace the extension if FileSG recognise the extension', () => {
      const name = 'nameWithExtension';
      const nameWithExtension = `${name}.${FILE_TYPE.JPEG}`;
      expect(service.reconcileZipEncryptedFileName(nameWithExtension)).toBe(`${name}.${FILE_TYPE.ZIP}`);
    });

    it('should append the name with the correct extension as last part might not be intended to be an extension', () => {
      const name = 'name.important';
      expect(service.reconcileZipEncryptedFileName(name)).toBe(`${name}.${FILE_TYPE.ZIP}`);
    });
  });

  describe('sendTransferMoveCompletedMessage', () => {
    it('should send success message with files_transfer_move_completed event when file session is of type transfer', async () => {
      const { fileSession, transaction, transfers } = mockTransferMoveTransferInfo;

      const successMessage: TransferMoveCompletedMessage = {
        event: EVENT.FILES_TRANSFER_MOVE_COMPLETED,
        payload: {
          fileSession,
          transaction,
          transfers: transfers.map(({ activityId, files }) => ({
            activityId: activityId,
            files: files.map((file) => ({ id: file.to.fileAssetUuid })),
          })),
        },
      };

      await service.sendTransferMoveCompletedMessage(fileSession, transaction, transfers);

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(successMessage);
    });
  });

  describe('sendMoveFailedMessage', () => {
    it('should send fail message with files_upload_move_completed event when file session is of type upload', async () => {
      const { fileSession, transaction, transfers } = mockUploadMoveTransferInfo;

      const firstTransfer = transfers[0];
      const firstTransferFile = firstTransfer.files[0];
      const failedMove = getFailedMove(firstTransferFile);
      const moveFailedTransfers = [getMoveFailedMessageTransfer(firstTransfer, firstTransferFile, failedMove)];

      const failureMessage: UploadMoveFailedMessage = {
        event: EVENT.FILES_UPLOAD_MOVE_FAILED,
        payload: {
          fileSession,
          transaction,
          transfers: moveFailedTransfers,
        },
      };

      await service.sendMoveFailedMessage(fileSession, transaction, moveFailedTransfers);

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(failureMessage);
    });

    it('should send fail message with files_transfer_move_completed event when file session is of type transfer', async () => {
      const { fileSession, transaction, transfers } = mockTransferMoveTransferInfo;

      const firstTransfer = transfers[0];
      const firstTransferFile = firstTransfer.files[0];
      const failedMove = getFailedMove(firstTransferFile);
      const moveFailedTransfers = [getMoveFailedMessageTransfer(firstTransfer, firstTransferFile, failedMove)];

      const failureMessage: TransferMoveFailedMessage = {
        event: EVENT.FILES_TRANSFER_MOVE_FAILED,
        payload: {
          fileSession,
          transaction,
          transfers: moveFailedTransfers,
        },
      };

      await service.sendMoveFailedMessage(fileSession, transaction, moveFailedTransfers);

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(failureMessage);
    });
  });

  describe('deleteAllFilesFromBucket', () => {
    it('should call deleteFilesFromStgCleanBucket with correct args if file session is of type upload', async () => {
      const {
        fileSession: { type: fileSessionType },
        transfers,
      } = mockUploadMoveTransferInfo;

      const filesToRemove = getFilesToBeRemoved(transfers);

      await service.deleteAllFilesFromBucket(fileSessionType, transfers);

      expect(mockS3Service.deleteFilesFromStgCleanBucket).toBeCalledWith(filesToRemove, mockS3Client);
    });

    it('should call deleteFilesAllVersionsFromMainBucket with correct args if file session is of type transfer', async () => {
      const {
        fileSession: { type: fileSessionType },
        transfers,
      } = mockTransferMoveTransferInfo;

      const filesToRemove = getFilesToBeRemoved(transfers);

      await service.deleteAllFilesFromBucket(fileSessionType, transfers);

      expect(mockS3Service.deleteFilesAllVersionsFromMainBucket).toBeCalledWith(filesToRemove, mockS3Client);
    });
  });
});
