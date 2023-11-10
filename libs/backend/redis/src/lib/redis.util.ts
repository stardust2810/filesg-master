import { ClusterOptions, RedisOptions } from 'ioredis';

import { RedisClient, RedisModuleOptions } from './redis.interface';

export const getStandaloneRedisModuleOptions = (
  { client, db }: RedisClient,
  host: string,
  port: number,
  username?: string,
  password?: string,
  additionalRedisOptions?: Partial<RedisOptions>,
): RedisModuleOptions => {
  return {
    name: client,
    isRedisCluster: false,
    redisConfig: {
      name: client,
      db,
      host,
      port,
      ...(username && { username }),
      ...(password && { password }),
      ...(!!additionalRedisOptions && additionalRedisOptions),
    },
  };
};

export const getClusterRedisModuleOptions = (
  { client, db }: RedisClient,
  host: string,
  port: number,
  username?: string,
  password?: string,
  additionalClusterOptions?: Partial<ClusterOptions>,
  additionalRedisOptions?: Partial<RedisOptions>,
): RedisModuleOptions => {
  return {
    name: client,
    isRedisCluster: true,
    redisConfig: {
      nodes: [
        {
          host,
          port,
        },
      ],
      options: {
        dnsLookup: (address, callback) => callback(null, address),
        ...additionalClusterOptions,
        redisOptions: {
          tls: {},
          name: client,
          db,
          ...(username && { username }),
          ...(password && { password }),
          ...additionalRedisOptions,
        },
      },
    },
  };
};
