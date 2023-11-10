import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';

import { FILESG_REDIS_CLIENT } from './redis.constants';

export interface RedisClient {
  client: FILESG_REDIS_CLIENT;
  db: number;
}

export interface RedisClusterOptions {
  nodes: ClusterNode[];
  options: ClusterOptions;
}

export interface RedisModuleOptions {
  name: string;
  isRedisCluster: boolean;
  redisConfig: RedisOptions | RedisClusterOptions;
}

export interface RedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => RedisModuleOptions[] | Promise<RedisModuleOptions[]>;
  inject?: any[];
}
