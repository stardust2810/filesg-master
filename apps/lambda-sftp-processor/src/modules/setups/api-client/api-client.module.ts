import { Module } from '@nestjs/common';

import { CoreServiceClientProvider, TransferServiceClientProvider } from './api-client.provider';

@Module({
  providers: [CoreServiceClientProvider, TransferServiceClientProvider],
  exports: [CoreServiceClientProvider, TransferServiceClientProvider],
})
export class ApiClientModule {}
