import { Module } from '@nestjs/common';

import { AwsModule } from '../aws/aws.module';
import { SliftService } from './slift.service';

@Module({
  providers: [SliftService],
  imports: [AwsModule],
  exports: [SliftService],
})
export class SliftModule {}
