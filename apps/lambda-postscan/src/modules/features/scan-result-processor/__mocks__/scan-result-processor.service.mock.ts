import { LambdaSnsEvent, ScanResultSnsMessage } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { StsService } from '../../aws/sts.service';

export const mockCredentials = 'test';
export const mockS3Client = 'test';

export const mockSqsService: MockService<SqsService> = {
  sendMessageToQueueCoreEvents: jest.fn(),
};

export const mockS3Service: MockService<S3Service> = {
  createAssumedClient: jest.fn().mockResolvedValue(() => mockS3Client),
  moveFileFromStgToStgClean: jest.fn(),
  deleteFileFromStgBucket: jest.fn(),
};

export const mockStsService: MockService<StsService> = {
  assumeScanMoveRole: jest.fn(() => mockCredentials),
};

export const mockVirusMessage = (fileSGConfigService: FileSGConfigService): ScanResultSnsMessage => {
  return {
    timestamp: 1587969985.4258394,
    sqs_message_id: 'mockSQSMessageId',
    xamz_request_id: '',
    file_url: `https://${fileSGConfigService.awsConfig.s3StgBucket}.s3.${fileSGConfigService.awsConfig.region}.amazonaws.com/mockFileAsset-uuid-1`,
    scanner_status: 0,
    scanner_status_message: 'successful scan',
    scanning_result: {
      TotalBytesOfFile: 68,
      Findings: [
        {
          malware: 'Eicar_test_file',
          type: 'Virus',
        },
      ],
      Error: '',
      Codes: [],
    },
  };
};

export const mockCleanMessage = (fileSGConfigService: FileSGConfigService): ScanResultSnsMessage => {
  return {
    timestamp: 1601002001.7012062,
    sqs_message_id: 'mockSQSMessageId',
    xamz_request_id: 'test',
    file_url: `https://${fileSGConfigService.awsConfig.s3StgBucket}.s3.${fileSGConfigService.awsConfig.region}.amazonaws.com/mockFileAsset-uuid-1`,
    scanner_status: 0,
    scanner_status_message: 'successful scan',
    scanning_result: {
      TotalBytesOfFile: 17346,
      Findings: [],
      Error: '',
      Codes: [],
    },
  };
};

export const mockScannerStatusErrorMessage = (fileSGConfigService: FileSGConfigService): ScanResultSnsMessage => {
  return {
    timestamp: 1589541828.884077,
    sqs_message_id: 'mockSQSMessageId',
    xamz_request_id: '',
    file_url: `https://${fileSGConfigService.awsConfig.s3StgBucket}.s3.${fileSGConfigService.awsConfig.region}.amazonaws.com/mockFileAsset-uuid-1`,
    scanner_status: -1,
    scanner_status_message: 'invalid license status',
    scanning_result: {
      Error: 'failed to verify license: invalid jwt',
    },
  };
};

export const mockCodeErrorMessage = (fileSGConfigService: FileSGConfigService): ScanResultSnsMessage => {
  return {
    timestamp: 1589541828.884077,
    sqs_message_id: 'mockSQSMessageId',
    xamz_request_id: '',
    file_url: `https://${fileSGConfigService.awsConfig.s3StgBucket}.s3.${fileSGConfigService.awsConfig.region}.amazonaws.com/mockFileAsset-uuid-1`,
    scanner_status: 0,
    scanner_status_message: 'successful scan',
    scanning_result: {
      TotalBytesOfFile: 17346,
      Findings: [],
      Error: '',
      Codes: [107],
    },
  };
};

export const mockLambdaSNSEvent = (mockMessage: ScanResultSnsMessage): LambdaSnsEvent => {
  return {
    Records: [
      {
        EventVersion: 'test',
        EventSubscriptionArn: 'test',
        EventSource: 'test',
        Sns: {
          SignatureVersion: 'test',
          Timestamp: 'test',
          Signature: 'test',
          SigningCertUrl: 'test',
          MessageId: 'mockMessageId',
          Message: JSON.stringify(mockMessage),
          MessageAttributes: {
            Test: {
              Type: 'test',
              Value: 'test',
            },
            TestBinary: {
              Type: 'test',
              Value: 'test',
            },
          },
          Type: 'test',
          UnsubscribeUrl: 'test',
          TopicArn: 'test',
          Subject: 'test',
        },
      },
    ],
  };
};
