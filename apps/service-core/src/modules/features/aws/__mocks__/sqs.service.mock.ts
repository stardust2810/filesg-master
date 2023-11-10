/* eslint-disable sonarjs/no-duplicate-string */
import { Message } from '@aws-sdk/client-sqs';
import { SqsService as BaseSqsService } from '@filesg/aws';
import { SqsTransferEventsMessage, UploadToStgCompletedMessage, UploadToStgFailedMessage } from '@filesg/backend-common';
import { EVENT, FILE_TYPE } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { SqsService } from '../sqs.service';

export const mockBaseSqsService: MockService<BaseSqsService> = {
  sendMessageToSqs: jest.fn(),
  receiveMessageFromSqs: jest.fn(),
  deleteMessageInSqs: jest.fn(),
  changeMessageVisibilityTimeout: jest.fn(),
};

export const mockSqsService: MockService<SqsService> = {
  sendMessageToQueueTransferEvents: jest.fn(),
  receiveMessageFromQueueCoreEvents: jest.fn(),
  receiveMessageFromQueueSesEvent: jest.fn(),
  deleteMessageInQueueCoreEvents: jest.fn(),
  deleteMessageInQueueSesEvent: jest.fn(),
  changeMessageVisiblityTimeoutInQueueCoreEvents: jest.fn(),
  changeMessageVisiblityTimeoutInQueueSesEvents: jest.fn(),
};

export const mockTransferEventsMessage: SqsTransferEventsMessage = {
  fileSessionId: 'mockFileSessionId',
};

export const mockSqsMessage: Message = {
  MessageId: 'mockMessageId',
};

export const mockUploadTransferSuccessfullTxnMessage: UploadToStgCompletedMessage = {
  event: EVENT.FILES_UPLOAD_TO_STG_COMPLETED,
  payload: {
    transactionId: 'mockTransaction-uuid-1',
    fileAssetInfos: [
      {
        fileName: 'mockFileName.pdf',
        fileAssetId: 'mockFileAsset-uuid-1',
        fileType: FILE_TYPE.OA,
        size: 1024,
      },
    ],
  },
};

export const mockUploadTransferWrongFileAssetIdTxnMessage: UploadToStgCompletedMessage = {
  event: EVENT.FILES_UPLOAD_TO_STG_COMPLETED,
  payload: {
    transactionId: 'mockWrongTransaction-uuid-1',
    fileAssetInfos: [
      {
        fileName: 'mockFileName.pdf',
        fileAssetId: 'unknownFileAsset-uuid-1',
        fileType: FILE_TYPE.OA,
        size: 1024,
      },
    ],
  },
};

export const mockUploadTransferFailedTxnMessage: UploadToStgFailedMessage = {
  event: EVENT.FILES_UPLOAD_TO_STG_FAILED,
  payload: {
    failedFiles: [{ fileAssetId: 'mockFileAsset-uuid-1', failedReason: 'Requested bucket not found in S3' }],
    transactionId: 'mockTransaction-uuid-1',
  },
};
