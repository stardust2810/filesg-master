import { DownloadInfoErrorException, LogMethod, UnknownFileSessionTypeException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, FILE_SESSION_TYPE, FileDownloadResponse, FileDownloadSession } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';

import { sha256HMac } from '../../../utils/common';
import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class FileDownloadService {
  private readonly logger = new Logger(FileDownloadService.name);
  constructor(private readonly redisService: RedisService, private readonly fileSGConfigService: FileSGConfigService) {}

  @LogMethod()
  public async retrieveDownloadInfo(fileSessionId: string) {
    const taskMessage = 'Retrieving download information from file session';
    this.logger.log(taskMessage);
    try {
      const data = await this.redisService.get(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionId);

      if (!data) {
        const internalLog = `No content retrieved for fileSessionId of: ${fileSessionId}`;
        throw new DownloadInfoErrorException(COMPONENT_ERROR_CODE.FILE_DOWNLOAD, fileSessionId, internalLog);
      }

      const fileSession: FileDownloadSession = JSON.parse(data);

      if (fileSession.type !== FILE_SESSION_TYPE.DOWNLOAD) {
        throw new UnknownFileSessionTypeException(COMPONENT_ERROR_CODE.FILE_DOWNLOAD, fileSession.type, 'process');
      }

      const fileDownloadInfo = this.generateDownloadInfo(fileSession);
      this.logger.log(`Download info generated: ${JSON.stringify(fileDownloadInfo)}`);

      this.logger.log(`Deleting file session`);
      await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionId);

      this.logger.log(`[Success] ${taskMessage}`);
      return fileDownloadInfo;
    } catch (error) {
      const internalLog = `[DownloadInfoFailure] ${taskMessage}: ${JSON.stringify(error)}`;
      throw new DownloadInfoErrorException(COMPONENT_ERROR_CODE.FILE_DOWNLOAD, fileSessionId, internalLog);
    }
  }

  private generateDownloadInfo(fileSession: FileDownloadSession): FileDownloadResponse {
    this.logger.log(`Generating download information`);

    const { ownerUuid } = fileSession;

    const ownerUuidHash = this.hashWithSecret(ownerUuid);

    return {
      ...fileSession,
      ownerUuidHash,
    };
  }

  private hashWithSecret(content: string) {
    const { prefixHashSecret } = this.fileSGConfigService.systemConfig;
    return sha256HMac(content, prefixHashSecret);
  }
}
