import { Message } from '@aws-sdk/client-sqs';
import { EmptyQueueMessageBodyException, SqsCoreEventsMessage } from '@filesg/backend-common';
import {
  CI_ENVIRONMENT,
  COMPONENT_ERROR_CODE,
  EVENT,
  FEATURE_TOGGLE,
  FILE_FAIL_CATEGORY,
  FILE_STATUS,
  jsonStringifyRedactor,
} from '@filesg/common';
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

import { sleepInSecs } from '../../../utils/helpers';
import { FileSGConfigService } from '../../setups/config/config.service';
import { SqsService } from '../aws/sqs.service';
import { DeleteEventService } from './events/delete-event.service';
import { DownloadEventService } from './events/download-event.service';
import { FormSgEventService } from './events/formsg-event.service';
import { MoveEventService } from './events/move-event.service';
import { PostScanEventService } from './events/post-scan-event.service';
import { UploadEventService } from './events/upload-event.service';

@Injectable()
export class CoreEventsQueueHandlerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(CoreEventsQueueHandlerService.name);
  private readonly serviceName = CoreEventsQueueHandlerService.name;

  constructor(
    private readonly awsSQSService: SqsService,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly uploadEventService: UploadEventService,
    private readonly postScanEventService: PostScanEventService,
    private readonly moveEventService: MoveEventService,
    private readonly downloadEventService: DownloadEventService,
    private readonly deleteEventService: DeleteEventService,
    private readonly formsgEventService: FormSgEventService,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('Start polling after all modules initialized');

    // NOTE: disable queue polling on local or not using localstack
    if (
      this.fileSGConfigService.systemConfig.env === CI_ENVIRONMENT.LOCAL &&
      this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.OFF
    ) {
      this.logger.log('No polling on local env with useLocalstack off');
      return;
    }

    this.startPolling();
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`onApplicationShutdown shutting down signal ${signal}`);
  }

  private async startPolling() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.pollHandler();
    }
  }

  protected async pollHandler() {
    let messages: Message[] | undefined;

    try {
      messages = await this.awsSQSService.receiveMessageFromQueueCoreEvents();
    } catch (error) {
      this.logger.error(`[Update Queue] Failed to consume message from SQS. Error: ${JSON.stringify(error)}`);
    }

    // If there is no messages from the long poll, sleep 2s before doing another long poll
    if (!messages || !(messages.length > 0)) {
      await sleepInSecs(this.fileSGConfigService.systemConfig.pollingSleepTimeInSeconds);
      return;
    }

    await Promise.allSettled(messages.map((message) => this.onMessageHandler(message)));
  }

  protected async onMessageHandler(message: Message) {
    this.logger.log(
      `[${this.serviceName} - onMessageHandler] Processing message: ${JSON.stringify(message, (key, value) => {
        if (key === 'Body') {
          try {
            return JSON.stringify(JSON.parse(value), jsonStringifyRedactor(['encryptedAgencyPassword']));
          } catch (error) {
            return value;
          }
        }
        return value;
      })}`,
    );

    try {
      if (!message.Body) {
        throw new EmptyQueueMessageBodyException(
          COMPONENT_ERROR_CODE.UPDATE_QUEUE_HANDLER_SERVICE,
          this.fileSGConfigService.awsConfig.coreEventsQueueUrl,
          message.MessageId,
        );
      }

      const messageBody = JSON.parse(message.Body) as SqsCoreEventsMessage;
      const { event } = messageBody;

      switch (event) {
        case EVENT.FILES_UPLOAD_TO_STG_COMPLETED: {
          this.logger.log(`Processing upload to stg completed event`);
          this.uploadEventService.uploadToStgSuccessHandler(messageBody);
          break;
        }

        case EVENT.FILES_UPLOAD_TO_STG_FAILED: {
          this.logger.log(`Processing upload to stg failed event`);
          this.uploadEventService.uploadtoStgFailedHandler(messageBody);
          break;
        }

        case EVENT.FILE_SCAN_SUCCESS: {
          this.logger.log(`Processing file scan success event`);
          const fileAssetUuid = messageBody.payload.fileAssetId;
          await this.postScanEventService.scanSuccessHandler(fileAssetUuid);
          break;
        }

        case EVENT.FILE_SCAN_VIRUS: {
          this.logger.log(`Processing file scan virus event`);
          const fileAssetUuid = messageBody.payload.fileAssetId;
          const failReason = messageBody.payload.error;

          await this.postScanEventService.scanVirusOrErrorHandler(fileAssetUuid, FILE_STATUS.FAILED, FILE_FAIL_CATEGORY.VIRUS, failReason);
          break;
        }

        case EVENT.FILE_SCAN_ERROR: {
          this.logger.log(`Processing file scan virus or error event`);
          const fileAssetUuid = messageBody.payload.fileAssetId;
          const failReason = messageBody.payload.error;

          await this.postScanEventService.scanVirusOrErrorHandler(
            fileAssetUuid,
            FILE_STATUS.FAILED,
            FILE_FAIL_CATEGORY.SCAN_ERROR,
            failReason,
          );
          break;
        }

        case EVENT.POST_SCAN_ERROR: {
          this.logger.log(`Processing post scan error event`);
          const fileAssetUuid = messageBody.payload.fileAssetId;
          const failReason = messageBody.payload.error;

          await this.postScanEventService.scanVirusOrErrorHandler(
            fileAssetUuid,
            FILE_STATUS.FAILED,
            FILE_FAIL_CATEGORY.POST_SCAN_ERROR,
            failReason,
          );
          break;
        }

        case EVENT.FILES_UPLOAD_MOVE_COMPLETED: {
          this.logger.log(`Processing upload move completed event`);
          await this.moveEventService.uploadMoveSuccessHandler(messageBody);
          break;
        }

        case EVENT.FILES_UPLOAD_MOVE_FAILED: {
          this.logger.log(`Processing upload move failed event`);
          await this.moveEventService.uploadMoveFailedHandler(messageBody);
          break;
        }

        case EVENT.FILES_TRANSFER_MOVE_COMPLETED: {
          this.logger.log(`Processing transfer move completed event`);
          await this.moveEventService.transferMoveSuccessHandler(messageBody);
          break;
        }

        case EVENT.FILES_TRANSFER_MOVE_FAILED: {
          this.logger.log(`Processing transfer move failed event`);
          await this.moveEventService.transferMoveFailedHandler(messageBody);
          break;
        }

        case EVENT.FILE_DELETE_SUCCESS: {
          this.logger.log(`Processing delete success event`);
          await this.deleteEventService.fileDeleteSuccessHandler(messageBody);
          break;
        }

        case EVENT.FILE_DELETE_FAILED: {
          this.logger.log(`Processing delete failed event`);
          await this.deleteEventService.fileDeleteFailureHandler(messageBody);
          break;
        }

        case EVENT.FILES_DOWNLOADED: {
          this.logger.log(`Processing file downloaded event`);
          await this.downloadEventService.fileDownloadedHandler(messageBody);
          break;
        }

        case EVENT.FORMSG_ISSUANCE_SUCCESS: {
          this.logger.log('Processing formsg single issuance success event');
          await this.formsgEventService.formSgIssuanceHandler(messageBody);
          break;
        }

        case EVENT.FORMSG_ISSUANCE_FAILURE: {
          this.logger.log('Processing formsg single issuance failure event');
          await this.formsgEventService.formSgIssuanceHandler(messageBody);
          break;
        }

        default: {
          this.logger.error(`Unknown event: ${JSON.stringify(event)}`);
          break;
        }
      }
      // delete message
      await this.awsSQSService.deleteMessageInQueueCoreEvents(message);

      this.logger.log(`[${this.serviceName} - onMessageHandler] MessageId: ${message.MessageId} processing end`);
    } catch (error) {
      this.logger.error(`[Update Queue] Message processing failed, ${JSON.stringify(error)}`);
      await this.awsSQSService.changeMessageVisiblityTimeoutInQueueCoreEvents(message, 0);
    }
  }
}
