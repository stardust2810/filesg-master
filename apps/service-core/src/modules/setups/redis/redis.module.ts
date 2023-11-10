import { CI_ENVIRONMENT } from '@filesg/common';
import {
  FILESG_REDIS_CLIENT,
  getClusterRedisModuleOptions,
  getStandaloneRedisModuleOptions,
  RedisClient,
  RedisModule as NestJsRedisModule,
  RedisModuleOptions,
} from '@filesg/redis';
import { Global, Logger, Module } from '@nestjs/common';

import { FileSGConfigService } from '../config/config.service';

const RedisModule = NestJsRedisModule.forRootAsync({
  useFactory: (configService: FileSGConfigService): RedisModuleOptions[] => {
    const logger = new Logger('RedisModule');
    logger.log('Start redis module');

    const { env } = configService.systemConfig;
    const { host, port, username, password } = configService.redisConfig;

    const isClusterMode = env !== CI_ENVIRONMENT.LOCAL;

    const redisClients: RedisClient[] = [
      { client: FILESG_REDIS_CLIENT.EXPRESS_SESSION, db: 0 },
      { client: FILESG_REDIS_CLIENT.USER, db: 1 },
      { client: FILESG_REDIS_CLIENT.FILE_SESSION, db: 2 },
      { client: FILESG_REDIS_CLIENT.WIDGET_SESSION, db: 3 },
      { client: FILESG_REDIS_CLIENT.OTP, db: 4 },
      { client: FILESG_REDIS_CLIENT.OA_DID_RESOLUTION, db: 5 },
      { client: FILESG_REDIS_CLIENT.FAILED_NOTIFICATION_REPORT, db: 6 },
      { client: FILESG_REDIS_CLIENT.SES_NOTIFICATION_DELIVERY, db: 7 },
      { client: FILESG_REDIS_CLIENT.CORPPASS_AGENCY, db: 8 },
    ];

    return redisClients.map((redisClient) => {
      return isClusterMode
        ? getClusterRedisModuleOptions(
            redisClient,
            host,
            port,
            username,
            password,
            { slotsRefreshTimeout: 5 * 1000 },
            { maxRetriesPerRequest: 3 },
          )
        : getStandaloneRedisModuleOptions(redisClient, host, port, undefined, undefined, { maxRetriesPerRequest: 3 });
    });
  },
  inject: [FileSGConfigService],
});

@Global()
@Module({
  imports: [RedisModule],
})
export class FileSGRedisModule {}
