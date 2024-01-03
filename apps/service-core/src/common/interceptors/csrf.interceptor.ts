import { COMPONENT_ERROR_CODE, COOKIE_HEADER, CSRF_KEY, ENVIRONMENT } from '@filesg/common';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';

import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { generateCsrfToken, getWhitelistedCsrfURLs } from '../../utils/helpers';
import { AUTH_KEY, AUTH_STATE, AuthInterface } from '../decorators/filesg-auth.decorator';
import { CSRFException } from '../filters/custom-exceptions.filter';

@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CsrfInterceptor.name);
  private sessionOptions: { httpOnly: boolean; secure: boolean; sameSite: boolean };

  constructor(private reflector: Reflector, private filesgConfigService: FileSGConfigService) {
    this.sessionOptions = {
      httpOnly: false,
      secure: this.filesgConfigService.systemConfig.nodeEnv === ENVIRONMENT.PRODUCTION,
      sameSite: true,
    };
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<Record<string, any>>> {
    const auth = this.reflector.getAllAndOverride<AuthInterface>(AUTH_KEY, [context.getHandler(), context.getClass()]);
    const contextHttp = context.switchToHttp();
    const req = contextHttp.getRequest();
    const res = contextHttp.getResponse();
    const requestUrl = req.originalUrl;
    const isUrlWhitelisted = getWhitelistedCsrfURLs().some((url) => requestUrl.startsWith(url));
    if (!isUrlWhitelisted) {
      if (req.method === 'GET' && requestUrl === '/api/core/v1/auth/user-session-details') {
        req.session.csrfToken = generateCsrfToken();
        res.cookie(CSRF_KEY, req.session.csrfToken, this.sessionOptions);
      }

      const isNonGetMethod = req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS';
      if (isNonGetMethod && [AUTH_STATE.CITIZEN_LOGGED_IN, AUTH_STATE.CORPORATE_USER_LOGGED_IN].includes(auth.auth_state)) {
        const sessionCsrfToken = req.session?.csrfToken;
        const headerCsrfToken = req.headers[COOKIE_HEADER];

        if (!headerCsrfToken || headerCsrfToken === 'undefined') {
          const internalLog = 'csrf token is missing';
          throw new CSRFException(COMPONENT_ERROR_CODE.CSRF_INTERCEPTOR, 'csrf token error', internalLog);
        }
        if (headerCsrfToken && sessionCsrfToken !== headerCsrfToken) {
          const internalLog = `csrf token is incorrect | sessionCsrfToken ${sessionCsrfToken} | headerCsrfToken ${headerCsrfToken}`;
          throw new CSRFException(COMPONENT_ERROR_CODE.CSRF_INTERCEPTOR, 'csrf token error', internalLog);
        }

        req.session.csrfToken = generateCsrfToken();
        req.session.save();
        res.cookie(CSRF_KEY, req.session.csrfToken, this.sessionOptions);
      }
    }
    return next.handle();
  }
}
