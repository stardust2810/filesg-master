import { ZipperModule } from '@filesg/zipper';
import { Module } from '@nestjs/common';

import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { AwsModule } from '../aws/aws.module';
import { SliftModule } from '../slift/sflit.module';
import { SftpProcessorService } from './sftp-processor.service';
import { SidecarFileService } from './sidecar-file.service';

@Module({
  providers: [SftpProcessorService, SidecarFileService],
  imports: [AwsModule, ZipperModule, SliftModule, ApiClientModule],
})
export class SftpProcessorModule {}
