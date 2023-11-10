import { Message } from '@aws-sdk/client-sqs';
import { EmptyQueueMessageBodyException, SqsTransferEventsMessage, TransferInfoErrorException } from '@filesg/backend-common';
import {
  CI_ENVIRONMENT,
  COMPONENT_ERROR_CODE,
  FEATURE_TOGGLE,
  FILE_SESSION_TYPE,
  FileDeleteInfoResponse,
  FileMoveInfoResponse,
  FileSessionResponse,
  jsonStringifyRedactor,
} from '@filesg/common';
import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AxiosInstance } from 'axios';

import { MGMT_SERVICE_API_CLIENT_PROVIDER } from '../../../typings/common';
import { sleepInSecs } from '../../../utils/common';
import { FileSGConfigService } from '../../setups/config/config.service';
import { SqsService } from '../aws/sqs.service';
import { DeleteService } from './move-type/delete.service';
import { UploadAndTransferMoveService } from './move-type/upload-transfer-move.service';

enum MESSAGE_TASK_TYPE {
  SHORT_TASK = 'short-task',
  LONG_TASK = 'long-task',
}

export interface MessageInfo {
  messageId: string;
  message: Message;
  fileSessionId: string;
  fileSessionType: FILE_SESSION_TYPE;
  transferInfo: FileSessionResponse;
  approximateReceiveCount: number;
}

@Injectable()
export class FileMoveService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FileMoveService.name);
  private readonly serviceName = FileMoveService.name;

  constructor(
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly sqsService: SqsService,
    private readonly uploadAndTransferMoveService: UploadAndTransferMoveService,
    private readonly deleteService: DeleteService,
    @Inject(MGMT_SERVICE_API_CLIENT_PROVIDER) private readonly mgmtServiceApiClient: AxiosInstance,
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

  private async startPolling() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.pollHandler();
    }
  }

  protected async pollHandler() {
    let messages: Message[] | undefined;

    try {
      messages = await this.sqsService.receiveMessageFromQueueTransferEvents();
    } catch (error) {
      this.logger.error(`[${this.serviceName} - pollHandler] Message consumption error: ${error}`);
    }

    // If there is no messages from the long poll, sleep 2s before doing another long poll
    if (!messages || !(messages.length > 0)) {
      await sleepInSecs(this.fileSGConfigService.systemConfig.pollingSleepTimeInSeconds);
      return;
    }

    const shortTaskMessages: MessageInfo[] = [];
    const longTaskMessages: MessageInfo[] = [];

    const preprocessMessageSettledResults = await Promise.allSettled(
      messages.map((message) => this.preprocessMessage(message, shortTaskMessages, longTaskMessages)),
    );

    const failedMessages: Message[] = [];

    preprocessMessageSettledResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        failedMessages.push(messages![index]);
      }
    });

    // if there is any failed preprocessing of message, make them visible again so that other service instance can pick it up
    if (failedMessages.length > 0) {
      await Promise.allSettled(
        failedMessages.map((failedMessage) => this.sqsService.changeMessageVisiblityTimeoutInQueueTransferEvents(failedMessage, 0)),
      );
    }

    // process long task message without await
    if (longTaskMessages.length > 0) {
      for (const messageInfo of longTaskMessages) {
        this.onMessageHandler(messageInfo);
      }
    }

    // process short task message with await
    if (shortTaskMessages.length > 0) {
      await Promise.allSettled(shortTaskMessages.map((messageInfo) => this.onMessageHandler(messageInfo)));
    }
  }

  private async preprocessMessage(message: Message, shortTaskMessages: MessageInfo[], longTaskMessages: MessageInfo[]) {
    if (!message.Body) {
      throw new EmptyQueueMessageBodyException(
        COMPONENT_ERROR_CODE.FILE_MOVE_SERVICE,
        this.fileSGConfigService.awsConfig.transferEventsQueueUrl,
        message.MessageId,
      );
    }

    const messageId = message.MessageId!;
    const approximateReceiveCount = parseInt(message.Attributes!['ApproximateReceiveCount']!);
    const { fileSessionId } = JSON.parse(message.Body) as SqsTransferEventsMessage;

    const taskMessage = `Preprocessing messageId: ${messageId} with fileSessionId: ${fileSessionId} and approximateReceiveCount: ${approximateReceiveCount}`;
    this.logger.log(`[${this.serviceName} - preprocessMessage] ${taskMessage}`);

    try {
      const transferInfo = await this.retrieveSessionInfo(fileSessionId);
      const { type: fileSessionType } = transferInfo.fileSession;

      let taskType = MESSAGE_TASK_TYPE.SHORT_TASK;

      if (fileSessionType === FILE_SESSION_TYPE.UPLOAD) {
        const { transfers } = transferInfo as FileMoveInfoResponse;

        // assuming there is always only one transfer for file session type upload
        const transfer = transfers[0];

        for (const file of transfer.files) {
          if (file.isPasswordEncryptionRequired) {
            taskType = MESSAGE_TASK_TYPE.LONG_TASK;
            break;
          }
        }
      }

      const arrayToUse = taskType === MESSAGE_TASK_TYPE.SHORT_TASK ? shortTaskMessages : longTaskMessages;

      arrayToUse.push({
        messageId,
        message,
        fileSessionId,
        fileSessionType,
        approximateReceiveCount,
        transferInfo,
      });
    } catch (error) {
      this.logger.error(`[${this.serviceName} - preprocessMessage] [Failed] ${taskMessage}. Error: ${error}`);
      throw error;
    }
  }

  // ===========================================================================
  // Handlers
  // ===========================================================================
  protected async onMessageHandler(messageInfo: MessageInfo) {
    const { messageId, message, fileSessionId, fileSessionType, transferInfo, approximateReceiveCount } = messageInfo;

    const taskMessage = `Handling messageId: ${messageId} with fileSessionId: ${fileSessionId} of type: ${fileSessionType} and approximateReceiveCount: ${approximateReceiveCount}`;

    try {
      this.logger.log(`[${this.serviceName} - onMessageHandler] ${taskMessage}`);

      switch (fileSessionType) {
        case FILE_SESSION_TYPE.UPLOAD:
        case FILE_SESSION_TYPE.TRANSFER:
          await this.uploadAndTransferMoveService.handleUploadAndTransferMove(
            transferInfo as FileMoveInfoResponse,
            approximateReceiveCount,
          );
          break;
        case FILE_SESSION_TYPE.DELETE:
          await this.deleteService.handleFilesDelete(transferInfo as FileDeleteInfoResponse, approximateReceiveCount);
          break;
        default:
          this.logger.error(`[${this.serviceName} - onMessageHandler] Unknown fileSessionType: ${fileSessionType}`);
          break;
      }

      await this.sqsService.deleteMessageInQueueTransferEvents(message);

      this.logger.log(`[${this.serviceName} - onMessageHandler] [Succeed] ${taskMessage}`);
    } catch (error) {
      // Throw error with messageId to allow DLQ debugging
      this.logger.error(`[${this.serviceName} - onMessageHandler] [Failed] ${taskMessage}. Error: ${error}`);

      await this.sqsService.changeMessageVisiblityTimeoutInQueueTransferEvents(message, 0);
    }
  }

  // ===========================================================================
  // Other methods
  // ===========================================================================
  protected async retrieveSessionInfo(fileSessionUuid: string): Promise<FileSessionResponse> {
    const taskMessage = `[${this.serviceName} - retrieveSessionInfo] Retrieving session info of ${fileSessionUuid} from management service`;

    try {
      this.logger.log(taskMessage);

      const response = await this.mgmtServiceApiClient.get<FileSessionResponse>(`v1/transfer-info/${fileSessionUuid}`);

      this.logger.log(
        `[${this.serviceName} - retrieveSessionInfo] [Succeed] Retrieved session info: ${JSON.stringify(
          response.data,
          jsonStringifyRedactor(['assumeRole', 'files', 'encryptedAgencyPassword']),
        )}`,
      );

      return response.data;
    } catch (error) {
      const internalLog = `[${this.serviceName} - retrieveSessionInfo] [Failed] ${taskMessage}. Error: ${error}`;
      throw new TransferInfoErrorException(COMPONENT_ERROR_CODE.FILE_MOVE_SERVICE, fileSessionUuid, internalLog);
    }
  }
}
