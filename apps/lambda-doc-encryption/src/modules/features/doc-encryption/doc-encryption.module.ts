import { ZipperModule } from '@filesg/zipper';
import { Module } from '@nestjs/common';

import { AwsModule } from '../aws/aws.module';
import { DocEncryptionService } from './doc-encryption.service';

@Module({
  providers: [DocEncryptionService],
  imports: [AwsModule, ZipperModule],
})
export class DocEncryptionModule {}
