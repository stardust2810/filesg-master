import { SqsCoreEventsMessage } from '@filesg/backend-common';
import { EVENT } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SCAN_RESULT_MESSAGE } from '../../../../typings/common';
import { urlToFileAssetUuid } from '../../../../utils/common';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { StsService } from '../../aws/sts.service';
import {
  mockCleanMessage,
  mockCodeErrorMessage,
  mockCredentials,
  mockLambdaSNSEvent,
  mockS3Service,
  mockScannerStatusErrorMessage,
  mockSqsService,
  mockStsService,
  mockVirusMessage,
} from '../__mocks__/scan-result-processor.service.mock';
import { ScanResultProcessorService } from '../scan-result-processor.service';

describe('ScanResultProcessorService', () => {
  let service: ScanResultProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanResultProcessorService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: SqsService, useValue: mockSqsService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: StsService, useValue: mockStsService },
      ],
    }).compile();

    service = module.get<ScanResultProcessorService>(ScanResultProcessorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processEvent method', () => {
    it('should be defined', () => {
      expect(service.processEvent).toBeDefined;
    });
  });

  describe('processEvent method with clean file', () => {
    it('should assume role, move file from stg to stg clean, and send message to "Core Events" queue', async () => {
      const mockMessage = mockCleanMessage(mockFileSGConfigService as FileSGConfigService);
      const mockCleanEvent = mockLambdaSNSEvent(mockMessage);
      expect(await service.processEvent(mockCleanEvent));

      const mockFileAssetId = urlToFileAssetUuid(mockMessage.file_url);

      expect(mockStsService.assumeScanMoveRole).toBeCalledTimes(1);
      expect(mockS3Service.createAssumedClient).toBeCalledWith(mockCredentials);
      expect(mockS3Service.moveFileFromStgToStgClean).toBeCalledTimes(1);

      const mockCleanFileQueueMessage: SqsCoreEventsMessage = {
        event: EVENT.FILE_SCAN_SUCCESS,
        payload: {
          fileAssetId: mockFileAssetId,
        },
      };

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(JSON.stringify(mockCleanFileQueueMessage));
    });
  });

  describe('processEvent method with virus file', () => {
    it('should assume role, delete file from stg, and send message to "Core Events" queue', async () => {
      const mockMessage = mockVirusMessage(mockFileSGConfigService as FileSGConfigService);
      const mockCleanEvent = mockLambdaSNSEvent(mockMessage);
      expect(await service.processEvent(mockCleanEvent));

      const mockFileAssetId = urlToFileAssetUuid(mockMessage.file_url);

      expect(mockStsService.assumeScanMoveRole).toBeCalledTimes(1);
      expect(mockS3Service.createAssumedClient).toBeCalledWith(mockCredentials);
      expect(mockS3Service.deleteFileFromStgBucket).toBeCalledTimes(1);

      const findings = mockMessage.scanner_status === 0 && mockMessage.scanning_result.Findings;
      const error = `Virus found: ${JSON.stringify(findings!)}`;
      const mockCleanFileQueueMessage: SqsCoreEventsMessage = {
        event: EVENT.FILE_SCAN_VIRUS,
        payload: {
          fileAssetId: mockFileAssetId,
          error,
        },
      };

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(JSON.stringify(mockCleanFileQueueMessage));
    });
  });

  describe('processEvent method with scanner status error file', () => {
    it('should assume role, delete file from stg, and send message to "Core Events" queue', async () => {
      const mockMessage = mockScannerStatusErrorMessage(mockFileSGConfigService as FileSGConfigService);
      const mockCleanEvent = mockLambdaSNSEvent(mockMessage);
      expect(await service.processEvent(mockCleanEvent));

      const mockFileAssetId = urlToFileAssetUuid(mockMessage.file_url);

      expect(mockStsService.assumeScanMoveRole).toBeCalledTimes(1);
      expect(mockS3Service.createAssumedClient).toBeCalledWith(mockCredentials);
      expect(mockS3Service.deleteFileFromStgBucket).toBeCalledTimes(1);

      const error = mockMessage.scanning_result.Error || mockMessage.scanner_status_message;

      const mockCleanFileQueueMessage: SqsCoreEventsMessage = {
        event: EVENT.FILE_SCAN_ERROR,
        payload: {
          fileAssetId: mockFileAssetId,
          error,
        },
      };

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(JSON.stringify(mockCleanFileQueueMessage));
    });
  });

  describe('processEvent method with code error file', () => {
    it('should assume role, delete file from stg, and send message to "Core Events" queue', async () => {
      const mockMessage = mockCodeErrorMessage(mockFileSGConfigService as FileSGConfigService);
      const mockCleanEvent = mockLambdaSNSEvent(mockMessage);
      expect(await service.processEvent(mockCleanEvent));

      const mockFileAssetId = urlToFileAssetUuid(mockMessage.file_url);

      expect(mockStsService.assumeScanMoveRole).toBeCalledTimes(1);
      expect(mockS3Service.createAssumedClient).toBeCalledWith(mockCredentials);
      expect(mockS3Service.deleteFileFromStgBucket).toBeCalledTimes(1);

      const error = mockMessage.scanner_status === 0 && SCAN_RESULT_MESSAGE[mockMessage.scanning_result.Codes[0]];

      const mockCleanFileQueueMessage: SqsCoreEventsMessage = {
        event: EVENT.FILE_SCAN_ERROR,
        payload: {
          fileAssetId: mockFileAssetId,
          error: error as string,
        },
      };

      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith(JSON.stringify(mockCleanFileQueueMessage));
    });
  });
});
