import { DynamicModule, Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

import { REDIS_CLIENT,REDIS_MODULE_OPTIONS } from './redis.constants';
import { RedisClusterOptions, RedisModuleAsyncOptions, RedisModuleOptions } from './redis.interface';
import { RedisService } from './redis.service';
import { createAsyncClientOptions, createClient, RedisClient } from './redis-client.provider';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisCoreModule implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_MODULE_OPTIONS) private readonly options: RedisModuleOptions[],
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  static forRoot(options: RedisModuleOptions[]): DynamicModule {
    return {
      module: RedisCoreModule,
      providers: [
        createClient(),
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [RedisService],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisCoreModule,
      imports: options.imports,
      providers: [createClient(), createAsyncClientOptions(options)],
      exports: [RedisService],
    };
  }

  onModuleDestroy() {
    const closeConnection =
      ({ clients }: RedisClient) =>
      (options: RedisModuleOptions) => {
        const name = options.name;
        const client = clients.get(name);

        const keepAlive = options.isRedisCluster
          ? (options.redisConfig as RedisClusterOptions).options.redisOptions?.keepAlive
          : (options.redisConfig as RedisOptions).keepAlive;

        if (client && !keepAlive) {
          client.disconnect();
        }
      };

    const closeClientConnection = closeConnection(this.redisClient);

    this.options.forEach(closeClientConnection);
  }
}
