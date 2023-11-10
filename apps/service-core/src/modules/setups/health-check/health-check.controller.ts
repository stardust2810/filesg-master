import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { RedisHealthIndicator } from './redis-health.health';

@Controller('health-check')
@ApiTags('health-check')
export class HealthCheckController {
  constructor(
    private readonly healthcheckService: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  async getHealthStatus() {
    return await this.healthcheckService.check([
      async () => this.typeOrmHealthIndicator.pingCheck('database'),
      async () => this.redisHealthIndicator.ping(),
    ]);
  }
}
