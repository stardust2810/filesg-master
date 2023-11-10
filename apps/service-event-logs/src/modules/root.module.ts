import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { EventsModule } from './features/events/events.module';
import { ReportingModule } from './features/reporting/reporting.module';
import { FileSGConfigModule } from './setups/config/config.module';
import { validateEnvConfig } from './setups/config/validate.service';
import { DatabaseModule } from './setups/database/db.module';
import { HealthCheckModule } from './setups/health-check/health-check.module';
import { InterceptorModule } from './setups/interceptor/interceptor.module';
import { FileSGLoggerModule } from './setups/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvConfig,
    }),
    FileSGConfigModule,
    FileSGLoggerModule,
    InterceptorModule,
    TerminusModule,
    HealthCheckModule,
    DatabaseModule,
    EventsModule,
    ReportingModule,
  ],
})
export class RootModule {}
