import { Module } from '@nestjs/common';

import { FileUploadAuthController } from './file-upload-auth.controller';
import { FileUploadAuthService } from './file-upload-auth.service';

@Module({
  controllers: [FileUploadAuthController],
  providers: [FileUploadAuthService],
})
export class FileUploadAuthModule {}
