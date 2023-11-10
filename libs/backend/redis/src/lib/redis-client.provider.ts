import { Provider } from '@nestjs/common';
import { Cluster, Redis, RedisOptions } from 'ioredis';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './redis.constants';
import { RedisClusterOptions, RedisModuleAsyncOptions, RedisModuleOptions } from './redis.interface';

export class RedisClientError extends Error {}

export interface RedisClient {
  clients: Map<string, Cluster | Redis>;
  size: number;
}

async function getClient(option: RedisModuleOptions) {
  const { isRedisCluster, redisConfig } = option;

  if (isRedisCluster) {
    const { nodes, options } = redisConfig as RedisClusterOptions;
    return new Cluster(nodes, options);
  }

  return new Redis(redisConfig as RedisOptions);
}

export const createClient = (): Provider => ({
  provide: REDIS_CLIENT,
  inject: [REDIS_MODULE_OPTIONS],
  useFactory: async (options: RedisModuleOptions[]): Promise<RedisClient> => {
    const clients = new Map<string, Cluster | Redis>();

    await Promise.all(
      options.map(async (o) => {
        const key = o.name;
        if (clients.has(key)) {
          throw new RedisClientError(`${key || 'default'} client is exists`);
        }
        clients.set(key, await getClient(o));
      }),
    );

    return {
      clients,
      size: clients.size,
    };
  },
});

export const createAsyncClientOptions = (options: RedisModuleAsyncOptions) => ({
  provide: REDIS_MODULE_OPTIONS,
  useFactory: options.useFactory,
  inject: options.inject,
});
