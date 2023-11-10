import { Body, Controller, HttpCode, Logger, Post, Session } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { LoginRequest, MockCorppassLoginRequest } from '../../../dtos/auth/request';
import { FileSGSession } from '../../../typings/common';
import { MockAuthService } from './mock-auth.service';

@ApiTags('auth')
@Controller('v1/auth')
export class MockAuthController {
  private readonly logger = new Logger(MockAuthController.name);

  constructor(private authService: MockAuthService) {}

  @Post('mock-login')
  @HttpCode(204)
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiBody({ type: LoginRequest })
  @ApiOkResponse({ description: 'Logs in as mock citizen.' })
  async mockCitizenLogin(@Session() session: FileSGSession, @Body() loginDto: LoginRequest) {
    this.logger.log(`User login with authcode: ${loginDto.authCode}`);
    return await this.authService.mockNdiLogin(session, loginDto);
  }

  @Post('mock-corppass-login')
  @HttpCode(204)
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiBody({ type: MockCorppassLoginRequest })
  @ApiOkResponse({ description: 'Logs in as mock corppass user.' })
  async mockCorppassLogin(@Session() session: FileSGSession, @Body() loginDto: MockCorppassLoginRequest) {
    const { uin, uen, role } = loginDto;
    this.logger.log(`User login with uin ${uin}, uen: ${uen} and role: ${role}`);
    return await this.authService.mockCorppassLogin(session, loginDto);
  }
}
