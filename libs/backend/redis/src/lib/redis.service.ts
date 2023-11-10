import { Inject, Injectable } from '@nestjs/common';
import { Cluster, Redis } from 'ioredis';

import { FILESG_REDIS_CLIENT, REDIS_CLIENT } from './redis.constants';
import { RedisClient, RedisClientError } from './redis-client.provider';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClient) {}

  // ===========================================================================
  // Client methods
  // ===========================================================================

  getClient(client: FILESG_REDIS_CLIENT): Cluster | Redis {
    if (!this.redisClient.clients.has(client)) {
      throw new RedisClientError(`client ${client} does not exist`);
    }

    return this.redisClient.clients.get(client)!;
  }

  getClients(): Map<string, Cluster | Redis> {
    return this.redisClient.clients;
  }

  async pingClient(client: FILESG_REDIS_CLIENT) {
    return await this.getClient(client).ping();
  }

  async pingClients() {
    const clients = this.getClients();
    const clientsPingArr: Promise<string>[] = [];
    clients.forEach((client) => {
      clientsPingArr.push(client.ping());
    });
    return await Promise.all(clientsPingArr);
  }

  // ===========================================================================
  // CRUD methods
  // ===========================================================================

  async get(client: FILESG_REDIS_CLIENT, key: string) {
    const redisClient = this.getClient(client);
    return await redisClient.get(key);
  }

  async mget(client: FILESG_REDIS_CLIENT, keys: string[]) {
    const redisClient = this.getClient(client);
    return await redisClient.mget(keys);
  }

  async set(client: FILESG_REDIS_CLIENT, key: string, val: string, setMode: 'NX', expTime: number): Promise<'OK' | null>;
  async set(client: FILESG_REDIS_CLIENT, key: string, val: string, setMode: 'NX', expTime?: number): Promise<'OK' | null>;
  async set(client: FILESG_REDIS_CLIENT, key: string, val: string, setMode: undefined, expTime: number): Promise<'OK' | null>;
  async set(client: FILESG_REDIS_CLIENT, key: string, val: string, setMode?: 'NX', expTime?: number): Promise<'OK' | null>;
  async set(client: FILESG_REDIS_CLIENT, key: string, val: string, setMode?: 'NX', expTime?: number): Promise<'OK' | null> {
    const redisClient = this.getClient(client);

    if (expTime) {
      if (setMode) {
        return await redisClient.set(key, val, 'EX', expTime, setMode);
      }
      return await redisClient.set(key, val, 'EX', expTime);
    }

    if (setMode) {
      return await redisClient.set(key, val, setMode);
    }

    return await redisClient.set(key, val);
  }

  async del(client: FILESG_REDIS_CLIENT, key: string) {
    const redisClient = this.getClient(client);
    return await redisClient.del(key);
  }
}
