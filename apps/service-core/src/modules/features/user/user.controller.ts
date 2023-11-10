import { AgencyListResponse, CheckDuplicateEmailResponse, DetailUserResponse, ERROR_RESPONSE_DESC } from '@filesg/common';
import { Controller, Get, Logger, Param, Put, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { RequestWithSession } from '../../../typings/common';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('v1/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('detail')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  @ApiOkResponse({ type: DetailUserResponse, description: 'Retrieves login user detail profile.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async retrieveUserDetail(@Req() req: RequestWithSession): Promise<DetailUserResponse> {
    return await this.userService.retrieveUserDetail(req.session.user.userUuid);
  }

  @Put('citizen/onboard')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  @ApiOkResponse({ description: 'Onboards citizen user.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async onboardCitizenUser(@Req() req: RequestWithSession) {
    await this.userService.onboardCitizenUser(req);
  }

  @Get('citizen/duplicate-email/:email')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  @ApiOkResponse({ description: 'Check for duplicate email' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async checkDuplicateEmail(@Param('email') email: string): Promise<CheckDuplicateEmailResponse> {
    return await this.userService.checkDuplicateEmail(email);
  }

  @Get('citizen/agency-list')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  @ApiOkResponse({ description: 'Get a list of agencies that issued files to a user' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async getAgencyList(@Req() req: RequestWithSession): Promise<AgencyListResponse> {
    return await this.userService.getAgencyList(req);
  }
}
