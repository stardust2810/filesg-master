import { Module } from '@nestjs/common';

import { DocEncryptionLambdaApiClientProvider, MgmtServiceApiClientProvider } from './api-client.provider';

// gd TODO: temporarily comment out until bug is fixed
@Module({
  // imports: [HttpAgentModule],
  providers: [MgmtServiceApiClientProvider, DocEncryptionLambdaApiClientProvider],
  exports: [MgmtServiceApiClientProvider, DocEncryptionLambdaApiClientProvider],
})
export class ApiClientModule {}
