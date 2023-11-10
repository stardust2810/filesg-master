import { ForbiddenException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtFileUploadAuthGuard extends AuthGuard('jwt-file-upload') {
  handleRequest(err: any, user: any, info: any) {
    if (err || info) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_FILE_UPLOAD_GUARD);
    }
    return user;
  }
}
