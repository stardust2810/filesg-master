import {
  AddNotificationTemplatesRequest,
  AddOrUpdateTemplateResponse,
  AddTransactionTemplatesRequest,
  AgencyOnboardingRequest,
  AgencyOnboardingResponse,
  AgencyUsersOnboardingRequest,
  ERROR_RESPONSE_DESC,
  EserviceAcknowledgementTemplateOnboardingRequest,
  EserviceAcknowledgementTemplateOnboardingResponse,
  EserviceOnboardingRequest,
  EserviceOnboardingResponse,
  EserviceWhitelistedUsersOnboardingRequest,
  FileSgStatisticsReportRequest,
  FileSgUserActionsReportRequest,
  IssuanceQueryRequest,
  IssuanceQueryResponse,
  ResendNotificationRequest,
  ROLE,
  TransactionReportRequest,
  UpdateNotificationTemplatesRequest,
  UpdateTransactionTemplatesRequest,
} from '@filesg/common';
import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, Query, Res, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { pipeline } from 'stream/promises';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { AppendTraceIdInterceptor } from '../../../common/interceptors/append-trace-id.interceptor';
import { AgencyOnboardingService } from './agency-onboarding.service';
import { ReportingService } from './reporting.service';
import { SystemService } from './system.service';

@ApiTags('system')
@Controller('v1/system')
export class SystemController {
  private readonly logger = new Logger(SystemController.name);

  constructor(
    private readonly agencyOnboardingService: AgencyOnboardingService,
    private readonly reportingService: ReportingService,
    private readonly systemService: SystemService,
  ) {}

  // ===========================================================================
  // Onboard
  // ===========================================================================
  @Post('onboard-agency')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: AgencyOnboardingRequest })
  @ApiOkResponse({ type: AgencyOnboardingResponse, description: 'Imports agency.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async onboardNewAgency(@Body() body: AgencyOnboardingRequest): Promise<AgencyOnboardingResponse> {
    return await this.agencyOnboardingService.onboardNewAgency(body);
  }

  @Post('onboard-eservice')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: EserviceOnboardingRequest })
  @ApiOkResponse({ type: EserviceOnboardingResponse, description: 'Imports eservice.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async onboardNewEservices(@Body() body: EserviceOnboardingRequest): Promise<EserviceOnboardingResponse> {
    return await this.agencyOnboardingService.onboardNewEservices(body);
  }

  @Post('onboard-eservice-acknowledgement-template')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: EserviceAcknowledgementTemplateOnboardingRequest })
  @ApiOkResponse({
    type: EserviceAcknowledgementTemplateOnboardingResponse,
    description: 'Imports new acknowledgement template to existing eservice.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async onboardNewEserviceAcknowledgementTemplate(@Body() body: EserviceAcknowledgementTemplateOnboardingRequest) {
    return await this.agencyOnboardingService.onboardNewEserviceAcknowledgementTemplate(body);
  }

  @Post('onboard/agency/transaction-template')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: AddTransactionTemplatesRequest })
  @ApiOkResponse({
    type: AddOrUpdateTemplateResponse,
    description: 'Imports new transaction custom message template to existing agency.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async onboardNewTransactionCustomMessageTemplate(@Body() body: AddTransactionTemplatesRequest) {
    return await this.agencyOnboardingService.onboardNewTransactionCustomMessageTemplate(body);
  }

  @Put('onboard/agency/transaction-template')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @HttpCode(204)
  @ApiBody({ type: UpdateTransactionTemplatesRequest })
  @ApiOkResponse({
    type: AddOrUpdateTemplateResponse,
    description: 'Update existing transaction custom message template to existing agency.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async updateTransactionCustomMessageTemplate(@Body() body: UpdateTransactionTemplatesRequest) {
    return await this.agencyOnboardingService.updateTransactionCustomMessageTemplate(body);
  }

  @Post('onboard/agency/notification-template')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: AddNotificationTemplatesRequest })
  @ApiOkResponse({
    type: AddOrUpdateTemplateResponse,
    description: 'Imports new notification message template to existing agency.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async onboardNewNotificationTemplate(@Body() body: AddNotificationTemplatesRequest) {
    return await this.agencyOnboardingService.onboardNewNotificationMessageTemplate(body);
  }

  @Put('onboard/agency/notification-template')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @HttpCode(204)
  @ApiBody({ type: UpdateNotificationTemplatesRequest })
  @ApiOkResponse({
    type: AddOrUpdateTemplateResponse,
    description: 'Update existing notification message template to existing agency.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async updateNotificationMessageTemplate(@Body() body: UpdateNotificationTemplatesRequest) {
    return await this.agencyOnboardingService.updateNotificationMessageTemplate(body);
  }

  @Post('onboard/agency/users')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: AgencyUsersOnboardingRequest })
  async onboardNewAgencyUsers(@Body() body: AgencyUsersOnboardingRequest) {
    return await this.agencyOnboardingService.onboardNewAgencyUsers(body);
  }

  @Post('onboard/eservice/whitelisted-users')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @HttpCode(204)
  @ApiBody({ type: EserviceWhitelistedUsersOnboardingRequest })
  @ApiOkResponse({ type: EserviceWhitelistedUsersOnboardingRequest, description: 'Adds new whitelisted users to eservice user.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async onboardNewEserviceWhitelistedUsers(@Body() body: EserviceWhitelistedUsersOnboardingRequest) {
    return await this.agencyOnboardingService.onboardNewEserviceWhitelistedUsers(body);
  }

  @Delete('onboard/eservice/whitelisted-users')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @HttpCode(204)
  @ApiBody({ type: EserviceWhitelistedUsersOnboardingRequest })
  @ApiOkResponse({ type: EserviceWhitelistedUsersOnboardingRequest, description: 'Set eservice whitelisted users to inactive.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async inactivateNewEserviceWhitelistedUsers(@Body() body: EserviceWhitelistedUsersOnboardingRequest) {
    return await this.agencyOnboardingService.inactivateNewEserviceWhitelistedUsers(body);
  }

  // ===========================================================================
  //  TECH OPS SUPPORT
  // ===========================================================================
  @Post('ops-support/notification/resend')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @HttpCode(204)
  @ApiBody({ type: ResendNotificationRequest })
  @ApiOkResponse({ type: String, description: 'Resend notification containing activity uuid.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  async resendNotification(@Body() body: ResendNotificationRequest) {
    return await this.systemService.resendNotification(body);
  }

  @Post('ops-support/activities/:activityUuid/lift-1fa')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @HttpCode(StatusCodes.OK)
  @ApiOkResponse({ description: 'Activity 1fa ban has been lifted.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  @UseInterceptors(AppendTraceIdInterceptor)
  async liftActivity1FaBan(@Param('activityUuid') activityUuid: string) {
    return await this.systemService.lift1FaBan(activityUuid);
  }

  @Post('ops-support/activities/:activityUuid/lift-2fa')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @HttpCode(StatusCodes.OK)
  @ApiOkResponse({ description: 'Activity 1fa ban has been lifted.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_ADMIN_ONLY })
  @UseInterceptors(AppendTraceIdInterceptor)
  async liftActivity2FaBan(@Param('activityUuid') activityUuid: string) {
    return await this.systemService.lift2FaBan(activityUuid);
  }

  @Post('ops-support/issuance/query')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: IssuanceQueryRequest })
  @ApiOkResponse({ type: IssuanceQueryResponse, description: 'Return issuance query result.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(200)
  async issuanceQuery(@Body() issuanceQueryRequest: IssuanceQueryRequest) {
    return await this.systemService.issuanceQuery(issuanceQueryRequest);
  }

  // ===========================================================================
  // Report
  // ===========================================================================
  @Get('report/agency-transactions/generate')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: TransactionReportRequest })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateAgencyTransactionsReport(@Query() transactionReportQuery: TransactionReportRequest, @Res() res: Response) {
    const { zipFileName, type, stream } = await this.reportingService.generateAgencyTransactionsReport(transactionReportQuery);

    res.set({
      'Content-Disposition': `attachment; filename=${zipFileName}`,
      'Content-Type': `${type}`,
    });

    try {
      await pipeline(stream, res);
    } catch (error) {
      this.logger.warn(`Piping stream failed. Error: ${error}`);
    }
  }

  @Post('report/filesg-statistics/generate')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: FileSgStatisticsReportRequest })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateFileSgStatisticsReport(@Body() fileSgStatisticsReportRequest: FileSgStatisticsReportRequest, @Res() res: Response) {
    const { zipFileName, type, stream } = await this.reportingService.generateFileSgStatisticsReport(fileSgStatisticsReportRequest);

    res.set({
      'Content-Disposition': `attachment; filename=${zipFileName}`,
      'Content-Type': `${type}`,
    });

    try {
      await pipeline(stream, res);
    } catch (error) {
      this.logger.warn(`Piping stream failed. Error: ${error}`);
    }
  }

  // TODO: (enhancement) output report to s3
  // TODO: (enhancement) split report after 1m records
  // TODO: come back again to discuss on whether to use POST or GET
  @Post('report/filesg-user-actions/generate')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.SYSTEM] })
  @ApiBody({ type: FileSgUserActionsReportRequest })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateFileSgUserActionsReport(@Body() fileSgUserActionsReportRequest: FileSgUserActionsReportRequest, @Res() res: Response) {
    const { zipFileName, type, stream } = await this.reportingService.generateFileSgUserActionsReport(fileSgUserActionsReportRequest);

    res.set({
      'Content-Disposition': `attachment; filename=${zipFileName}`,
      'Content-Type': `${type}`,
    });

    try {
      await pipeline(stream, res);
    } catch (error) {
      this.logger.warn(`Piping stream failed. Error: ${error}`);
    }
  }
}
