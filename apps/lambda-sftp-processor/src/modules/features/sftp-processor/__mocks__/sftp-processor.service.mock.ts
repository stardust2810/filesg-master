import { CreateFileTransactionV2Request, TRANSACTION_TYPE } from '@filesg/common';
import { FileTypeResult } from 'file-type';

import { SidecarData } from '../../../../common/dtos/sidecar-data';
import { LambdaSqsMessage } from '../../../../typings';
import { SftpProcessorService } from '../sftp-processor.service';

export class TestSftpProcessorService extends SftpProcessorService {
  public async preProcess(paths: ReturnType<typeof this.generateFilePaths>): Promise<void> {
    return await super.preProcess(paths);
  }

  public async parseAndValidateCsv(paths: ReturnType<typeof this.generateFilePaths>): Promise<SidecarData> {
    return await super.parseAndValidateCsv(paths);
  }

  public async process(paths: ReturnType<typeof this.generateFilePaths>, sidecarData: SidecarData) {
    return await super.process(paths, sidecarData);
  }

  public async postProcess(paths: ReturnType<typeof this.generateFilePaths>, message: LambdaSqsMessage) {
    return await super.postProcess(paths, message);
  }

  public async clean(paths: ReturnType<typeof this.generateFilePaths>) {
    return await super.clean(paths);
  }

  public generateFilePaths(s3Key: string) {
    return super.generateFilePaths(s3Key);
  }

  public deriveFilenames(s3Key: string) {
    return super.deriveFilenames(s3Key);
  }

  public async checkForMissingIssuanceFiles(paths: ReturnType<typeof this.generateFilePaths>, sidecarData: SidecarData) {
    return await super.checkForMissingIssuanceFiles(paths, sidecarData);
  }

  public async checkForExtraIssuanceFiles(paths: ReturnType<typeof this.generateFilePaths>, sidecarData: SidecarData) {
    return await super.checkForExtraIssuanceFiles(paths, sidecarData);
  }

  public async detectAndPopulateMimeType(paths: ReturnType<typeof this.generateFilePaths>, sidecarData: SidecarData) {
    return await super.detectAndPopulateMimeType(paths, sidecarData);
  }

  public async validateFilePathInsideAgencyPasswordSidecar(paths: ReturnType<typeof this.generateFilePaths>, sidecarData: SidecarData) {
    return await super.validateFilePathInsideAgencyPasswordSidecar(paths, sidecarData);
  }

  public async createTransaction(sidecarData: SidecarData) {
    return await super.createTransaction(sidecarData);
  }

  public async uploadTransactionFiles(uploadJwt: string, sidecarData: SidecarData, s3WorkingDir: string) {
    return await super.uploadTransactionFiles(uploadJwt, sidecarData, s3WorkingDir);
  }

  public getCreateTransactionPayload(sidecarData: SidecarData) {
    return super.getCreateTransactionPayload(sidecarData);
  }

  public getUploadTransactionFilesPayload(sidecarData: SidecarData, s3WorkingDir: string) {
    return super.getUploadTransactionFilesPayload(sidecarData, s3WorkingDir);
  }

  public async errorHandler(error: unknown, filePath: string, messageId: string, msgReceiptHandle: string) {
    return await super.errorHandler(error, filePath, messageId, msgReceiptHandle);
  }
}

export const mockFromFile = jest.fn();
export const mockJwt = 'mockJwt';
export const mockFilePath = 'mockFilePath';
export const mockS3Key = 'agency/agency/eservice/mock.zip.p7';
export const mockPaths = (uuid: string) => ({
  s3Key: mockS3Key,
  agencyCode: 'agency',
  eserviceCode: 'eservice',
  processUuid: uuid,
  localWorkingDir: `/tmp/${uuid}`,
  encryptedZip: `/tmp/${uuid}/mock.zip.p7`,
  plainZip: `/tmp/${uuid}/mock.zip`,
  extractedZipDir: `/tmp/${uuid}/extracted`,
  encryptedFileName: 'mock.zip.p7',
  plainFileName: 'mock.zip',
  s3WorkingDir: `processing/agency/eservice/${uuid}`,
});

export const mockCreateTransactionPayload: CreateFileTransactionV2Request = {
  files: [],
  application: {
    type: 'mockType',
  },
  transaction: {
    type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
    name: 'mockTransactionName',
    isAcknowledgementRequired: false,
    customAgencyMessage: {
      transaction: {
        templateId: 'transactioncustommessagetemplate-1655625225500-9c72b9eac3dc42f6',
      },
      notifications: [],
    },
    recipients: [],
  },
};

export const mockCreateTransactionResponse = {
  accessToken: mockJwt,
  transactionUuid: 'mock-transaction-uuid',
  files: [],
  recipients: [],
};

export const mockFileTypeResult: FileTypeResult = {
  ext: 'pdf',
  mime: 'application/pdf',
};

export const mockLambdaSqsMessage: LambdaSqsMessage = {
  messageId: '47566e31-fdf0-4b24-afb6-00111f44d372',
  receiptHandle:
    'AQEBcE/lEd4PswOmqMBMgJE8p73gTESBu0PPhRMlwmk3op7qIT0FMOpw8KMkGG9qc4zXmFiiB2EDFXFB3kb3SnRtCLYAWvxhxpdKTrSQDXTENbGLeLxaky3NWbH4QVyEpFnBnedQtQ/GlUWA2WsZit5GBFW2sg4p4b/OsuqHr4uIDgIsoAV8b606dicyV9Zwqs2g/49crlHMUNO45611olawZI0iM+JYrNj72Y97itxn/RCLAYI07KNZWYbCBR516KWNKh3Id5rhTQBII+hFoUGSQhlbtjUc3CCsXJREkPl5DVJiLgOvT2cjzzEJmnX0PLhkT8gN8PikxP3ewcTFkzZ3Yh5iBkd4sGHROsdgNLFpO9w4UMU0AuSkl6SYJQZ1SVs/O1WxI7ossmGf2UUhR3W+amLnfUbrkxzfzwiZ6leCxag=',
  body: `{"Records":[{"eventVersion":"2.1","eventSource":"aws:s3","awsRegion":"ap-southeast-1","eventTime":"2023-02-16T06: 11: 51.658Z","eventName":"ObjectCreated:CompleteMultipartUpload","userIdentity":{"principalId":"AWS:AROAS33CCP77CP53LPJUZ:testuser_eld_dev.f04b84ef96807d33@s-dad9bb2e55b245e19"},"requestParameters":{"sourceIPAddress":"10.0.70.209"},"responseElements":{"x-amz-request-id":"75YTY85SJF189HT4","x-amz-id-2":"ro4O6+6GJdLxccELGxbrmLRJAfh982ZwgN6Qzb94aRjx1feW6UEtZnkyvFJMdOCtZo3oC732ALWXDL0AdnzKk5Yg9WkmBOZR"},"s3":{"s3SchemaVersion":"1.0","configurationId":"tf-s3-queue-20230110061942058400000001","bucket":{"name":"s3-fsg2-devezapp-sftp","ownerIdentity":{"principalId":"A1MR42ZUNHRVHE"},"arn":"arn:aws:s3: : :s3-fsg2-devezapp-sftp"},"object":{"key":"${mockS3Key}","size":49250304,"eTag":"4b2eade1c93832cc00d350c795f59716-10","sequencer":"0063EDC923BC27A38A"}}}]}`,
  attributes: {
    ApproximateReceiveCount: '1',
    SentTimestamp: '1676527913114',
    SenderId: 'AIDAIOLRDRJE5M7S2TL4G',
    ApproximateFirstReceiveTimestamp: '1676527913116',
  },
  messageAttributes: {},
  md5OfBody: 'ca143ba1150b5b40b5ec06bbcbfb487d',
  eventSource: 'aws:sqs',
  eventSourceARN: 'arn:aws:sqs:ap-southeast-1:197237309438:sqs-fsg2-devezapp-sftp-processor',
  awsRegion: 'ap-southeast-1',
};
