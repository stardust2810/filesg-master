import { Module } from '@nestjs/common';

import { FileDownloadController } from './file-download.controller';
import { FileDownloadService } from './file-download.service';

@Module({
  controllers: [FileDownloadController],
  providers: [FileDownloadService],
})
export class FileDownloadModule {}
