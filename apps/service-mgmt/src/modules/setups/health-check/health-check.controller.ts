import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { RedisHealthIndicator } from './redis-health.health';

@Controller('health-check')
@ApiTags('health-check')
export class HealthCheckController {
  constructor(private readonly healthcheckService: HealthCheckService, private readonly redisHealthIndicator: RedisHealthIndicator) {}

  @Get()
  @HealthCheck()
  async getHealthStatus() {
    return await this.healthcheckService.check([async () => this.redisHealthIndicator.ping()]);
  }
}
