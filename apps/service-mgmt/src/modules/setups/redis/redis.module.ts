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
  inject: [FileSGConfigService],
  useFactory: (configService: FileSGConfigService): RedisModuleOptions[] => {
    const logger = new Logger('RedisModule');
    logger.log('Start redis module');

    const { env } = configService.systemConfig;
    const { host, port, username, password } = configService.redisConfig;

    const isClusterMode = env !== CI_ENVIRONMENT.LOCAL;

    const redisClients: RedisClient[] = [
      {
        client: FILESG_REDIS_CLIENT.FILE_SESSION,
        db: 2,
      },
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
});

@Global()
@Module({
  imports: [RedisModule],
})
export class FileSGRedisModule {}
