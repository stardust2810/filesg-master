import { Module } from '@nestjs/common';

import { UnzipService } from './unzip.service';
import { ZipService } from './zip.service';

@Module({
  providers: [ZipService, UnzipService],
  exports: [ZipService, UnzipService],
})
export class ZipperModule {}
