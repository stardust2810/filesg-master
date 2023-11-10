import { Module } from '@nestjs/common';

import { JwtFileDownloadStrategy } from '../../../common/strategies/jwt-file-download.strategy';
import { JwtFileUploadStrategy } from '../../../common/strategies/jwt-file-upload.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtFileUploadStrategy, JwtFileDownloadStrategy],
})
export class AuthModule {}
