import { COOKIE_ID, ERROR_RESPONSE_DESC, GetLoginContextResponse, LogoutResponse } from '@filesg/common';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Req, Res, Session } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { LoginRequest } from '../../../dtos/auth/request';
import { User } from '../../../entities/user';
import { FileSGCorporateUserSession, RequestWithCorporateUserSession } from '../../../typings/common';
import { CorppassAuthService } from './auth.corppass.service';

@ApiTags('auth')
@Controller('v1/auth/corppass')
export class CorppassAuthController {
  private readonly logger = new Logger(CorppassAuthController.name);

  constructor(private corppassAuthService: CorppassAuthService) {}

  //===================================================
  // Corppass Login / Logout
  //===================================================
  @Get('login-context')
  @ApiOkResponse({ type: GetLoginContextResponse, description: 'Returns the ndi endpoint for frontend redirection' })
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  async getLoginContext() {
    return this.corppassAuthService.getLoginContext();
  }

  @Post('login')
  @HttpCode(HttpStatus.NO_CONTENT)
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiBody({ type: LoginRequest })
  @ApiOkResponse({ type: User, description: 'Logs in as corporate user.' })
  async corpassLogin(@Session() session: FileSGCorporateUserSession, @Body() loginDto: LoginRequest) {
    this.logger.log(`Corpass login with authcode: ${loginDto.authCode}`);
    return this.corppassAuthService.ndiLogin(session, loginDto);
  }

  @Post('logout')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN, requireOnboardedUser: false })
  @ApiOkResponse({ type: LogoutResponse, description: 'Logs out.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async logout(
    @Req() req: RequestWithCorporateUserSession,
    @Res({ passthrough: true }) res: Response,
    @Session() session: FileSGCorporateUserSession,
  ): Promise<LogoutResponse> {
    await this.corppassAuthService.logout(req.session.user.userId, session);
    res.clearCookie(COOKIE_ID);
    return { sessionEndTime: new Date().toISOString() };
  }
}
