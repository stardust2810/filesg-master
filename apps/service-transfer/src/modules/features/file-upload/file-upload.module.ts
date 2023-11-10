import { Module } from '@nestjs/common';

import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { AuthModule } from '../auth/auth.module';
import { AWSModule } from '../aws/aws.module';
import { OaDocumentModule } from '../oa-document/oa-document.module';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [AWSModule, AuthModule, OaDocumentModule, ApiClientModule],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
