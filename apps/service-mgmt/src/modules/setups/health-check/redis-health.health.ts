import { RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private logger = new Logger(RedisHealthIndicator.name);

  constructor(private readonly redisService: RedisService) {
    super();
  }

  async ping() {
    this.logger.log('Start pinging redis clients health');
    try {
      const result = await this.redisService.pingClients();
      this.logger.log(`Redis health check result ${result}`);
      return this.getStatus('redis', true);
    } catch (error) {
      throw new HealthCheckError('RedisHealthIndicator failed', this.getStatus('redis', false));
    }
  }
}
