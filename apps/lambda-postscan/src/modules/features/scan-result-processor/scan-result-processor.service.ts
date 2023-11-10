import { SqsCoreEventsMessage } from '@filesg/backend-common';
import { EVENT } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import {
  CODE_MISC,
  CODE_SKIP_MULTIPLE,
  FSS_TAG_PREFIX,
  LambdaSnsEvent,
  SCAN_RESULT_MESSAGE,
  SCAN_RESULT_TAG,
  ScanResultSnsMessage,
} from '../../../typings/common';
import { urlToFileAssetUuid } from '../../../utils/common';
import { transformSecondsToDateString } from '../../../utils/date-helpers';
import { S3Service } from '../aws/s3.service';
import { SqsService } from '../aws/sqs.service';
import { StsService } from '../aws/sts.service';

@Injectable()
export class ScanResultProcessorService {
  private readonly logger = new Logger(ScanResultProcessorService.name);

  constructor(private readonly sqsService: SqsService, private readonly s3Service: S3Service, private readonly stsService: StsService) {}
  // ===========================================================================
  // Process Event
  // ===========================================================================
  public async processEvent(event: LambdaSnsEvent) {
    // Each SNS notification will only contain one record
    // https://stackoverflow.com/questions/33690231/when-lambda-is-invoked-by-sns-will-there-always-be-just-1-record

    this.logger.log(`Processing message: ${event.Records[0].Sns.MessageId}`);
    const message: ScanResultSnsMessage = JSON.parse(event.Records[0].Sns.Message);
    const fileAssetUuid = urlToFileAssetUuid(message.file_url);

    try {
      this.logger.log(`[Timing] Starting processEvent with file asset of ${fileAssetUuid}`);

      const scannerStatus = message.scanner_status;
      this.logger.log(`Scanner Status: ${scannerStatus}`);

      // if no scanner error and incomplete scan
      if (scannerStatus === 0 && message.scanning_result.Codes.length === 0) {
        const findings = message.scanning_result.Findings;
        this.logger.log(`Findings: ${JSON.stringify(findings)}`);

        if (findings.length === 0) {
          const scanDate = transformSecondsToDateString(message.timestamp);

          await this.cleanFileHandler(fileAssetUuid, scanDate);
        } else {
          const error = `Virus found: ${JSON.stringify(findings)}`;

          await this.virusFileHandler(fileAssetUuid, error);
        }
      } else {
        await this.errorFileHandler(fileAssetUuid, message);
      }

      this.logger.log(`End Processing`);
      this.logger.log(`[Timing] Ended processEvent with file asset of ${fileAssetUuid}`);
    } catch (error) {
      // updating to be updated queue
      const errorQueueMessage: SqsCoreEventsMessage = {
        event: EVENT.POST_SCAN_ERROR,
        payload: {
          fileAssetId: fileAssetUuid,
          error: (error as Error).message,
        },
      };

      await this.sqsService.sendMessageToQueueCoreEvents(JSON.stringify(errorQueueMessage));
      this.logger.error(`[processEvent] Failed to handle post scan: ${error}`);
    }
  }

  // ===========================================================================
  // Handlers
  // ===========================================================================
  private async cleanFileHandler(fileAssetId: string, scanDate: string) {
    this.logger.log(`[Timing] Starting cleanFileHandler with file asset of ${fileAssetId}`);
    this.logger.log(`No virus found`);

    // Tagging
    const tagsArray = [
      `${FSS_TAG_PREFIX}scanned=true`,
      `${FSS_TAG_PREFIX}scan-date=${encodeURIComponent(scanDate)}`,
      `${FSS_TAG_PREFIX}scan-result=${encodeURIComponent(SCAN_RESULT_TAG.NO_ISSUES_FOUND)}`,
      `${FSS_TAG_PREFIX}scan-detail-code=0`,
      `${FSS_TAG_PREFIX}scan-detail-message=`,
    ];
    this.logger.log(`Tag generated: ${tagsArray.join(', ')}`);

    // assume role and create s3 client
    const credentials = await this.stsService.assumeScanMoveRole();
    const s3Client = await this.s3Service.createAssumedClient(credentials);

    // Move file form stg to stg-clean
    await this.s3Service.moveFileFromStgToStgClean(fileAssetId, tagsArray.join('&'), s3Client);

    // send message to To Be Updated Queue
    const cleanFileQueueMessage: SqsCoreEventsMessage = {
      event: EVENT.FILE_SCAN_SUCCESS,
      payload: {
        fileAssetId,
      },
    };

    await this.sqsService.sendMessageToQueueCoreEvents(JSON.stringify(cleanFileQueueMessage));
    this.logger.log(`[Timing] Ended cleanFileHandler with file asset of ${fileAssetId}`);
  }

  private async virusFileHandler(fileAssetId: string, error: string) {
    this.logger.log(`[Timing] Starting virusFileHandler with file asset of ${fileAssetId}`);

    this.logger.log(error);
    // assume role and create s3 client
    const credentials = await this.stsService.assumeScanMoveRole();
    const s3Client = await this.s3Service.createAssumedClient(credentials);

    // deleting file from stg
    await this.s3Service.deleteFileFromStgBucket(fileAssetId, s3Client);

    // updating to be updated queue
    const errorQueueMessage: SqsCoreEventsMessage = {
      event: EVENT.FILE_SCAN_VIRUS,
      payload: {
        fileAssetId,
        error,
      },
    };

    await this.sqsService.sendMessageToQueueCoreEvents(JSON.stringify(errorQueueMessage));

    this.logger.log(`[Timing] Ended virusFileHandler with file asset of ${fileAssetId}`);
  }

  private async errorFileHandler(fileAssetId: string, message: ScanResultSnsMessage) {
    this.logger.log(`[Timing] Starting errorFileHandler with file asset of ${fileAssetId}`);

    const scannerStatus = message.scanner_status;
    const isScannerError = scannerStatus !== 0;
    const isIncompleteScan = scannerStatus === 0 && message.scanning_result.Codes.length > 0;

    let error = '';
    if (isScannerError) {
      const detailedError = message.scanning_result.Error;
      error = detailedError || message.scanner_status_message;
    }

    if (isIncompleteScan) {
      const codes = message.scanning_result.Codes;
      this.logger.log(`Incomplete scanning status code(s): ${codes}`);

      const isCodeMultiple = codes.length > 1;
      const isCodeMisc = !isCodeMultiple && !SCAN_RESULT_MESSAGE[codes[0]];

      let code: number;
      if (isCodeMultiple) {
        code = CODE_SKIP_MULTIPLE;
      } else if (isCodeMisc) {
        code = CODE_MISC;
      } else {
        code = codes[0];
      }

      error = SCAN_RESULT_MESSAGE[code];
    }

    this.logger.log(`Scanning error: ${error}`);

    // assume role and create s3 client
    const credentials = await this.stsService.assumeScanMoveRole();
    const s3Client = await this.s3Service.createAssumedClient(credentials);

    // deleting file from stg
    await this.s3Service.deleteFileFromStgBucket(fileAssetId, s3Client);

    // updating to be updated queue
    const errorQueueMessage: SqsCoreEventsMessage = {
      event: EVENT.FILE_SCAN_ERROR,
      payload: {
        fileAssetId,
        error,
      },
    };

    await this.sqsService.sendMessageToQueueCoreEvents(JSON.stringify(errorQueueMessage));

    this.logger.log(`[Timing] Ended errorFileHandler with file asset of ${fileAssetId}`);
  }
}
