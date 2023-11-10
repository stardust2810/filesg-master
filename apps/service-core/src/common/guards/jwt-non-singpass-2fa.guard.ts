import { ForbiddenException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AUTH_STRATEGY_NAME } from '../../consts';

@Injectable()
export class JwtNonSingpass2faAuthGuard extends AuthGuard(AUTH_STRATEGY_NAME.JWT_NON_SINGPASS_2FA) {
  handleRequest(err: any, user: any, info: any) {
    if (err || info) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_NON_SINGPASS_2FA_GUARD);
    }
    return user;
  }
}
