import { LogMethod, TransferInfoErrorException, UnknownFileSessionTypeException } from '@filesg/backend-common';
import {
  AssumeTransferMoveRole,
  AssumeUploadMoveRole,
  COMPONENT_ERROR_CODE,
  FILE_SESSION_TYPE,
  FileAssetDeleteDetails,
  FileDeleteInfoResponse,
  FileDeleteSession,
  FileDeleteSessionInfo,
  FileMoveInfoResponse,
  FileSession,
  FileTransfer,
  FileTransferMoveSession,
  FileUploadMoveSession,
  jsonStringifyRedactor,
  TransferFile,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';

import { sha256HMac } from '../../../utils/common';
import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class TransferInfoService {
  private readonly logger = new Logger(TransferInfoService.name);

  constructor(private readonly redisService: RedisService, private readonly fileSGConfigService: FileSGConfigService) {}

  @LogMethod()
  async retrieveFileSessionInfo(fileSessionUuid: string) {
    try {
      const data = await this.redisService.get(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionUuid);

      if (!data) {
        const internalLog = `No content retrieved for fileSessionId of: ${fileSessionUuid}`;
        throw new TransferInfoErrorException(COMPONENT_ERROR_CODE.TRANSFER_MANAGE_SERVICE, fileSessionUuid, internalLog);
      }

      const fileSession = JSON.parse(data) as FileSession;
      this.logger.log(
        `Retrieved filesession: ${JSON.stringify(
          fileSession,
          jsonStringifyRedactor(['owner', 'receiver', 'files', 'encryptedAgencyPassword']),
        )}`,
      );
      switch (fileSession.type) {
        case FILE_SESSION_TYPE.UPLOAD:
          return this.transformUploadSession(fileSession, fileSessionUuid);

        case FILE_SESSION_TYPE.TRANSFER:
          return this.transformTransferSession(fileSession, fileSessionUuid);

        case FILE_SESSION_TYPE.DELETE:
          return await this.transformDeleteSession(fileSession, fileSessionUuid);

        default:
          throw new UnknownFileSessionTypeException(COMPONENT_ERROR_CODE.TRANSFER_MANAGE_SERVICE, fileSession.type, 'process');
      }
    } catch (error) {
      const internalLog = `Error getting transfer info: ${JSON.stringify(error)}`;
      throw new TransferInfoErrorException(COMPONENT_ERROR_CODE.TRANSFER_MANAGE_SERVICE, fileSessionUuid, internalLog);
    }
  }

  @LogMethod({ keysToRedact: ['encryptedAgencyPassword'] })
  private transformUploadSession(uploadSession: FileUploadMoveSession, fileSessionId: string): FileMoveInfoResponse {
    const { stgCleanFileBucketName, mainFileBucketName } = this.fileSGConfigService.awsConfig;
    const { type, transaction, transfers: transferFromRedis } = uploadSession;

    const transfers: FileTransfer[] = transferFromRedis.map((transfer) => {
      const { activityId, owner, files: transferFiles } = transfer;
      const ownerHashedPrefix = this.hashWithSecret(owner.id);

      const assumeRole: AssumeUploadMoveRole = {
        receiver: ownerHashedPrefix,
      };

      const files = transferFiles.reduce<TransferFile[]>(
        (prev, { ownerFileAssetId, name, isPasswordEncryptionRequired, encryptedAgencyPassword }): TransferFile[] => {
          prev.push({
            from: {
              fileAssetUuid: ownerFileAssetId,
              key: ownerFileAssetId,
            },
            to: {
              fileAssetUuid: ownerFileAssetId,
              key: `${ownerHashedPrefix}/${ownerFileAssetId}`,
            },
            name,
            isPasswordEncryptionRequired,
            encryptedAgencyPassword,
          });
          return prev;
        },
        [],
      );

      return {
        activityId,
        assumeRole,
        files,
      };
    });

    return {
      fileSession: { id: fileSessionId, type },
      transaction,
      fromBucket: stgCleanFileBucketName,
      toBucket: mainFileBucketName,
      transfers,
    };
  }

  @LogMethod({ keysToRedact: ['owner', 'receiver', 'files', 'encryptedPassword'] })
  private transformTransferSession(transferSession: FileTransferMoveSession, fileSessionId: string): FileMoveInfoResponse {
    const { mainFileBucketName } = this.fileSGConfigService.awsConfig;
    const { type, transaction, transfers: transferFromRedis } = transferSession;

    const transfers: FileTransfer[] = transferFromRedis.map((transfer) => {
      const { activityId, owner, receiver, files: transferFiles, encryptedPassword } = transfer;
      const ownerHashPrefix = this.hashWithSecret(owner.id);
      const receiverHashPrefix = this.hashWithSecret(receiver.id);

      const assumeRole: AssumeTransferMoveRole = {
        owner: ownerHashPrefix,
        receiver: receiverHashPrefix,
      };

      const files = transferFiles.reduce<TransferFile[]>((prev, { ownerFileAssetId, receiverFileAssetId, updates }) => {
        prev.push({
          from: {
            fileAssetUuid: ownerFileAssetId,
            key: `${ownerHashPrefix}/${ownerFileAssetId}`,
          },
          to: {
            fileAssetUuid: receiverFileAssetId,
            key: `${receiverHashPrefix}/${receiverFileAssetId}`,
          },
          updates,
        });
        return prev;
      }, []);

      return {
        activityId,
        assumeRole,
        files,
        encryptedPassword,
      };
    });

    return {
      fileSession: { id: fileSessionId, type },
      transaction,
      fromBucket: mainFileBucketName,
      toBucket: mainFileBucketName,
      transfers,
    };
  }

  private async transformDeleteSession(fileDeleteSession: FileDeleteSession, fileSessionUuid: string): Promise<FileDeleteInfoResponse> {
    const { fileAssetDeleteSessionDetails, type } = fileDeleteSession;

    const fileSession: FileDeleteSessionInfo = {
      id: fileSessionUuid,
      type,
    };

    const fileAssetDeleteDetails: FileAssetDeleteDetails[] = fileAssetDeleteSessionDetails.map<FileAssetDeleteDetails>(
      ({ transactionId, transactionType, activityId, activityType, issuerId, owner, files }) => {
        const { ownerId, ownerUuid } = owner;
        const ownerHash = this.hashWithSecret(ownerUuid);

        return {
          transactionId,
          transactionType,
          activityId,
          activityType,
          assumeRole: {
            owner: ownerHash,
          },
          issuerId,
          ownerId,
          files: files.map(({ fileAssetId, fileAssetUuid, oaCertId }) => ({
            fileAssetId,
            key: `${ownerHash}/${fileAssetUuid}`,
            oaCertId,
          })),
        };
      },
    );

    return {
      fileSession,
      fileAssetDeleteDetails,
    };
  }

  private hashWithSecret(content: string) {
    const { prefixHashSecret } = this.fileSGConfigService.systemConfig;
    return sha256HMac(content, prefixHashSecret);
  }
}
