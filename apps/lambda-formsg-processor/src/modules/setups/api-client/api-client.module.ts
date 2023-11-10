import { Module } from '@nestjs/common';

import { AwsModule } from '../../features/aws/aws.module';
import { CoreServiceClientProvider, EventLogsServiceClientProvider, TransferServiceClientProvider } from './api-client.provider';

@Module({
  imports: [AwsModule],
  providers: [CoreServiceClientProvider, TransferServiceClientProvider, EventLogsServiceClientProvider],
  exports: [CoreServiceClientProvider, TransferServiceClientProvider, EventLogsServiceClientProvider],
})
export class ApiClientModule {}
