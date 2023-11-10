import { FileSessionErrorException, LogMethod } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { FILESG_REDIS_CLIENT, FILESG_REDIS_NAMESPACE, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FileUploadAuthService {
  private readonly logger = new Logger(FileUploadAuthService.name);
  constructor(private readonly redisService: RedisService) {}

  @LogMethod()
  public async checkAndDeleteExistingSession(fileSessionId: string) {
    const taskMessage = 'Check and delete file session if it exists';
    this.logger.log(taskMessage);

    const fileUploadInfoId = `${FILESG_REDIS_NAMESPACE.FILE_UPLOAD_INFO}:${fileSessionId}`;
    try {
      const data = await this.redisService.get(FILESG_REDIS_CLIENT.FILE_SESSION, fileUploadInfoId);

      if (!data) {
        this.logger.warn(`There is no existing file session for sessionId: ${fileSessionId}`);
        return null;
      }
      
      await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileUploadInfoId);

      return data;
    } catch (error) {
      const internalLog = `[CheckAndDeleteExistingSessionFailure] ${taskMessage}: ${JSON.stringify(error)}`;
      throw new FileSessionErrorException(COMPONENT_ERROR_CODE.FILE_UPLOAD_AUTH, fileSessionId, internalLog);
    }
  }
}
