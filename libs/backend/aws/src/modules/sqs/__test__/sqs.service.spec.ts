/* eslint-disable sonarjs/no-duplicate-string */
import { SQSClient } from '@aws-sdk/client-sqs';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AWSHttpException } from '../../../common/filters/custom-exceptions';
import { SQS_CLIENT } from '../../../typings/sqs.typing';
import { mockQueue, mockSqsMessageWithoutReceiptHandle } from '../__mocks__/sqs.service.mock';
import { SqsService } from '../sqs.service';

describe('SqsService', () => {
  let service: SqsService;
  const baseSqsClient = new SQSClient({});

  /** FIXME: @aws-sdk/types dep for SQS is different from other aws services.
   * Unable to use client mock
   * */
  // const mockBaseSqsClient = mockClient(baseSqsClient);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqsService,
        {
          provide: SQS_CLIENT,
          useValue: baseSqsClient,
        },
      ],
    }).compile();

    service = module.get<SqsService>(SqsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessageToSqs', () => {
    it('should be defined', () => {
      expect(service.sendMessageToSqs).toBeDefined();
    });
  });

  describe('receiveMessageFromSqs', () => {
    it('should be defined', () => {
      expect(service.receiveMessageFromSqs).toBeDefined();
    });
  });

  describe('deleteMessageInSqs', () => {
    it('should be defined', () => {
      expect(service.deleteMessageInSqs).toBeDefined();
    });

    it('should throw exception if ReceiptHandle is missing from Message', async () => {
      const { MessageId } = mockSqsMessageWithoutReceiptHandle;

      await expect(service.deleteMessageInSqs(mockQueue, mockSqsMessageWithoutReceiptHandle)).rejects.toThrow(
        new AWSHttpException(
          COMPONENT_ERROR_CODE.SQS_SERVICE,
          `Unable to delete message from queue: Message ${MessageId} missing receipt handle`,
        ),
      );
    });
  });
});
