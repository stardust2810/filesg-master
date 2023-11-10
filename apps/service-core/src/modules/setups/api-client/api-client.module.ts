import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ApexCloudService } from './apex-cloud.service';
import { ApexClientProvider, EventLogServiceApiClientProvider, MccApiClientProvider, MyIcaClientProvider } from './api-client.provider';

// gd TODO: temporarily comment out until bug is fixed
//TODO: remove ApexService after migration
@Module({
  // imports: [HttpAgentModule],
  providers: [
    EventLogServiceApiClientProvider,
    MyIcaClientProvider,
    MccApiClientProvider,
    ApexClientProvider,
    ApexCloudService,
    JwtService,
  ],
  exports: [EventLogServiceApiClientProvider, ApexClientProvider, MyIcaClientProvider, MccApiClientProvider],
})
export class ApiClientModule {}
