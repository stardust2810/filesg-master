import { Module } from '@nestjs/common';

import { AwsModule } from '../../../modules/features/aws/aws.module';
import { ScanResultProcessorService } from './scan-result-processor.service';

@Module({
  providers: [ScanResultProcessorService],
  imports: [AwsModule],
  exports: [ScanResultProcessorService],
})
export class ScanResultProcessorModule {}
