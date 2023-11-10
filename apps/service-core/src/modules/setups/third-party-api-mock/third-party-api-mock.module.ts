import { Module } from '@nestjs/common';

import { FileSGConfigModule } from '../config/config.module';
import { ThirdPartyApiMockService } from './third-party-api-mock.service';

@Module({
  providers: [ThirdPartyApiMockService],
  imports: [FileSGConfigModule],
})
export class ThirdPartyApiMockModule {}
