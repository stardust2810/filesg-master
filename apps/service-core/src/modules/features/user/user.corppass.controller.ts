import { AgencyListResponse, ERROR_RESPONSE_DESC } from '@filesg/common';
import { Controller, Get, Logger, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { RequestWithCorporateUserSession } from '../../../typings/common';
import { CorppassUserService } from './user..corppass.service';

@ApiTags('user')
@Controller('v1/corppass/user')
export class CorppassUserController {
  private readonly logger = new Logger(CorppassUserController.name);

  constructor(private readonly corppassUserService: CorppassUserService) {}

  @Get('corppass/agency-list')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ description: 'Get a list of agencies that issued files to a corporate user' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async getCorporateAgencyListByAccessibleAgency(@Req() req: RequestWithCorporateUserSession): Promise<AgencyListResponse> {
    return await this.corppassUserService.getCorporateAgencyListByAccessibleAgency(req.session.user);
  }
}
