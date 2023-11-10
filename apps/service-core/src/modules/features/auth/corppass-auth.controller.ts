import { GetLoginContextResponse } from '@filesg/common';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Session } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { LoginRequest } from '../../../dtos/auth/request';
import { User } from '../../../entities/user';
import { FileSGSession } from '../../../typings/common';
import { CorppassAuthService } from './corppass-auth.service';

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
  @ApiOkResponse({ type: User, description: 'Logs in as citizen.' })
  async corpassLogin(@Session() session: FileSGSession, @Body() loginDto: LoginRequest) {
    this.logger.log(`Corpass login with authcode: ${loginDto.authCode}`);
    return await this.corppassAuthService.ndiLogin(session, loginDto);
  }
}
