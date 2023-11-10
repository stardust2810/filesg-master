import { ZipperModule } from '@filesg/zipper';
import { Module } from '@nestjs/common';

import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { AuthModule } from '../auth/auth.module';
import { AWSModule } from '../aws/aws.module';
import { OaDocumentModule } from '../oa-document/oa-document.module';
import { FileDownloadController } from './file-download.controller';
import { FileDownloadService } from './file-download.service';

@Module({
  controllers: [FileDownloadController],
  providers: [FileDownloadService],
  imports: [AWSModule, ApiClientModule, AuthModule, ZipperModule, OaDocumentModule],
})
export class FileDownloadModule {}
