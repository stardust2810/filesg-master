import { ActivitiesResponse, ActivityDetailsResponse, CompletedActivitiesRequestDto, ERROR_RESPONSE_DESC } from '@filesg/common';
import { Controller, Get, Logger, Param, Query, Req } from '@nestjs/common';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { RequestWithCorporateUserSession } from '../../../typings/common';
import { TransactionActivityService } from './transaction-activity.service';

@ApiTags('transaction')
@Controller('v1/transaction/corppass')
export class CorppassTransactionController {
  private readonly logger = new Logger(CorppassTransactionController.name);

  constructor(private readonly transactionActivityService: TransactionActivityService) {}

  @Get('/activities')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ type: ActivitiesResponse, description: "Retrieves corporate's activities" })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CORPORATE_ONLY })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY })
  async retrieveCorppassActivities(@Req() req: RequestWithCorporateUserSession, @Query() query: CompletedActivitiesRequestDto) {
    const { user } = req.session;
    return await this.transactionActivityService.retrieveCorporateActivities(user, query);
  }

  @Get('/activities/:activityUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiParam({
    name: 'activityUuid',
    required: true,
    type: String,
    example: 'FSG-xxxxxxxx-xxxxxxxxxxxxxxxx or activity-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
  })
  @ApiOkResponse({ type: ActivityDetailsResponse, description: 'Retrieves activity details.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CORPORATE_ONLY })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY })
  async retrieveCorppassActivityDetails(@Param('activityUuid') activityUuid: string, @Req() req: RequestWithCorporateUserSession) {
    const { user } = req.session;
    return await this.transactionActivityService.retrieveCorporateActivityDetails(activityUuid, user);
  }
}
