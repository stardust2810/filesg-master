import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthCheckController } from './health-check.controller';
import { RedisHealthIndicator } from './redis-health.health';

@Module({
  controllers: [HealthCheckController],
  providers: [RedisHealthIndicator],
  imports: [TerminusModule],
})
export class HealthCheckModule {}
