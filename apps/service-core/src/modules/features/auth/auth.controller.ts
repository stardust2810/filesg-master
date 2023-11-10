import { COOKIE_ID, GetLoginContextResponse, IcaSsoRequest, LogoutResponse } from '@filesg/common';
import { ERROR_RESPONSE_DESC, UserSessionDetailsResponse } from '@filesg/common';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Req, Res, Session } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { transformUserSessionDetailsResponse } from '../../../common/transformers/auth.transformer';
import { LoginRequest } from '../../../dtos/auth/request';
import { User } from '../../../entities/user';
import { FileSGSession, RequestWithSession } from '../../../typings/common';
import { AuthService } from '../auth/auth.service';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  //===================================================
  // Singpass Login / Logout
  //===================================================
  @Get('login-context')
  @ApiOkResponse({ type: GetLoginContextResponse, description: 'Returns the ndi endpoint for frontend redirection' })
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  async getLoginContext() {
    return this.authService.getLoginContext();
  }

  @Post('login')
  @HttpCode(HttpStatus.NO_CONTENT)
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiBody({ type: LoginRequest })
  @ApiOkResponse({ type: User, description: 'Logs in as citizen.' })
  async citizenLogin(@Session() session: FileSGSession, @Body() loginDto: LoginRequest) {
    this.logger.log(`User login with authcode: ${loginDto.authCode}`);
    return await this.authService.ndiLogin(session, loginDto);
  }

  @Post('logout')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  @ApiOkResponse({ type: LogoutResponse, description: 'Logs out.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async logout(
    @Req() req: RequestWithSession,
    @Res({ passthrough: true }) res: Response,
    @Session() session: FileSGSession,
  ): Promise<LogoutResponse> {
    await this.authService.citizenLogout(req.session.user.userId, session);
    res.clearCookie(COOKIE_ID);
    return { sessionEndTime: new Date().toISOString() };
  }

  //===================================================
  // Session Information
  //===================================================
  @Get('user-session-details')
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiOkResponse({ type: UserSessionDetailsResponse, description: 'Retrieves user details.' })
  async getUserDetails(@Session() session: FileSGSession): Promise<UserSessionDetailsResponse | null> {
    if (!session?.user) {
      return null;
    }
    return transformUserSessionDetailsResponse(session.user);
  }

  //===================================================
  // MyInfo fetching
  //===================================================
  @Get('update-user-from-myinfo')
  @HttpCode(HttpStatus.OK)
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  async updateUserDetailsUsingMyInfo(@Session() { user }: FileSGSession) {
    return this.authService.updateUserDetailsFromMyInfo(user);
  }

  //===================================================
  // external agency auth integration
  //===================================================
  @Post('ica-sso')
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiBody({ type: IcaSsoRequest })
  async icaSso(@Session() session: FileSGSession, @Body() { token }: IcaSsoRequest) {
    return await this.authService.icaSso(token, session);
  }

  @Get('update-user-from-mcc')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  async updateUserFromMcc(@Session() { user }: FileSGSession) {
    return await this.authService.updateUserFromMcc(user);
  }
}
