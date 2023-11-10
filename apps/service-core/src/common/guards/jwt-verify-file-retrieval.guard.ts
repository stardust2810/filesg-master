import { ForbiddenException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AUTH_STRATEGY_NAME } from '../../consts';
import { JwtExpiredException } from '../filters/custom-exceptions.filter';

@Injectable()
export class JwtVerifyFileRetrievalAuthGuard extends AuthGuard(AUTH_STRATEGY_NAME.JWT_VERIFY_FILE_RETRIEVAL) {
  handleRequest(err: any, user: any, info: Error) {
    /**
     * JWT service uses jsonwebtoken's verify method, which returns a JSONWebTokenError if validation fails.
     * Only way to differentiate the errors is through the error message
     * https://github.com/auth0/node-jsonwebtoken/blob/master/verify.js
     * */
    if (info?.message === 'jwt expired') {
      throw new JwtExpiredException(COMPONENT_ERROR_CODE.JWT_VERIFY_FILE_RETRIEVAL_GUARD);
    }

    if (err || info) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_VERIFY_FILE_RETRIEVAL_GUARD);
    }
    return user;
  }
}
