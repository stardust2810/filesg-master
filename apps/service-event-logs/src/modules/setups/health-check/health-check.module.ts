import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthCheckController } from './health-check.controller';

@Module({
  controllers: [HealthCheckController],
  providers: [],
  imports: [TerminusModule],
})
export class HealthCheckModule {}
