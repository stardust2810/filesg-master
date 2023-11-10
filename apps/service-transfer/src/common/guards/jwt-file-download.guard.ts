import { ForbiddenException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtFileDownloadAuthGuard extends AuthGuard('jwt-file-download') {
  handleRequest(err: any, user: any, info: any) {
    if (err || info) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_FILE_DOWNLOAD_GUARD);
    }
    return user;
  }
}
