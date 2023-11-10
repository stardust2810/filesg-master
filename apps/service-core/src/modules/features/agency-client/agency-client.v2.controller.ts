import { AgencyClientPhotoRequest, AgencyClientPhotoResponse } from '@filesg/common';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { AgencyClientV2Service } from './agency-client.v2.service';

@ApiTags('agency-client')
@Controller('v2/agency-client')
export class AgencyClientV2Controller {
  constructor(private readonly agencyClientService: AgencyClientV2Service) {}
  private readonly logger = new Logger(AgencyClientV2Controller.name);

  @Post('retrieve-photo')
  @HttpCode(HttpStatus.OK)
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiBody({ type: AgencyClientPhotoRequest })
  @ApiOkResponse({ type: Boolean, description: 'Retrieves photo from external agency' })
  async retrievePhotoFromCiris(@Body() body: AgencyClientPhotoRequest): Promise<AgencyClientPhotoResponse> {
    const { oaDocument } = body;
    return await this.agencyClientService.retrieveOaImage(oaDocument);
  }
}
