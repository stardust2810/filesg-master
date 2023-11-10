import { Module } from '@nestjs/common';

import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { OpenAttestationModule } from '../open-attestation/open-attestation.module';
import { AgencyClientV2Controller } from './agency-client.v2.controller';
import { AgencyClientV2Service } from './agency-client.v2.service';

@Module({
  imports: [ApiClientModule, OpenAttestationModule],
  controllers: [AgencyClientV2Controller],
  providers: [AgencyClientV2Service],
  exports: [AgencyClientV2Service],
})
export class AgencyClientModule {}
