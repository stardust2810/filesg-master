import { EntityNotFoundException } from '@filesg/backend-common';
import {
  ActivitiesResponse,
  ActivityDetailsResponse,
  CompletedActivitiesRequestDto,
  COMPONENT_ERROR_CODE,
  CreateFileTransactionRequest,
  CreateFileTransactionResponse,
  ERROR_RESPONSE_DESC,
  ErrorResponse,
  RetrieveActivityRetrievableOptionsResponse,
  RevokeTransactionRequest,
  RevokeTransactionResponseDto,
  ROLE,
  TransactionStatusResponse,
  UpdateRecipientInfoRequest,
  UpdateRecipientInfoResponse,
  UpdateUserEmailForTransactionRequest,
} from '@filesg/common';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { UpdateResult } from 'typeorm';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import {
  ActivityAcknowledgementNotRequiredException,
  ActivityHadAlreadyBeenAcknowledgedException,
} from '../../../common/filters/custom-exceptions.filter';
import { JwtNonSingpassContentRetrievalAuthGuard } from '../../../common/guards/jwt-non-singpass-content-retrieval.guard';
import { AppendTraceIdInterceptor } from '../../../common/interceptors/append-trace-id.interceptor';
import { SWAGGER_AUTH_NAME } from '../../../consts';
import { Activity } from '../../../entities/activity';
import { NonSingpassContentRetrievalRequest, RequestWithCitizenSession, RequestWithProgrammaticSession } from '../../../typings/common';
import { generateExceptionsTableMarkdown } from '../../../utils/swagger-helpers';
import { FileTransactionService } from './file-transaction.service';
import { RecipientService } from './recipient.service';
import { RevokeTransactionService } from './revoke-transaction.service';
import { TransactionService } from './transaction.service';
import { TransactionActivityService } from './transaction-activity.service';

@ApiTags('transaction')
@Controller('v1/transaction')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly transactionActivityService: TransactionActivityService,
    private readonly transactionService: TransactionService,
    private readonly revokeTransactionService: RevokeTransactionService,
    private readonly fileTransactionService: FileTransactionService,
    private readonly recipientService: RecipientService,
  ) {}

  @Post('file/client')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @ApiTags('apigw', 'tech-doc:issuance')
  @ApiOperation({
    summary: 'create transaction (v1)',
    description: 'Use version 2 of the create transaction API. \n\nThis API endpoint enables agencies to initiate a transaction request.',
    deprecated: true,
  })
  @ApiBody({ type: CreateFileTransactionRequest })
  @ApiOkResponse({
    type: CreateFileTransactionResponse,
    description:
      'Returns a JSON object which contains the authorization access token (JWT) that will be used to upload the document to FileSG.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY, type: ErrorResponse })
  @UseInterceptors(AppendTraceIdInterceptor)
  async createFileTransactionForProgrammaticUser(
    @Req() req: RequestWithProgrammaticSession,
    @Body() body: CreateFileTransactionRequest,
  ): Promise<CreateFileTransactionResponse> {
    this.logger.log(`Client[${req.session.user.userId}] user creating file transaction`);

    return await this.fileTransactionService.createFileTransaction(req.session.user.userId, body);
  }

  // ---------------------------------------------------------------------------
  // Activity
  // ---------------------------------------------------------------------------
  @Get('/activities')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ type: ActivitiesResponse, description: "Retrieves user's activities" })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY })
  async retrieveActivities(@Req() req: RequestWithCitizenSession, @Query() query: CompletedActivitiesRequestDto) {
    const { userId } = req.session.user;
    return await this.transactionActivityService.retrieveActivities(userId, query);
  }

  @Get('/activities/:activityUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiParam({
    name: 'activityUuid',
    required: true,
    type: String,
    example: 'FSG-xxxxxxxx-xxxxxxxxxxxxxxxx or activity-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
  })
  @ApiOkResponse({ type: ActivityDetailsResponse, description: 'Retrieves activity details.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CITIZEN_ONLY })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY })
  async retrieveActivityDetails(@Param('activityUuid') activityUuid: string, @Req() req: RequestWithCitizenSession) {
    const { userId } = req.session.user;
    return await this.transactionActivityService.retrieveActivityDetails(activityUuid, userId);
  }

  @Post('/activities/:activityUuid/acknowledge')
  @HttpCode(HttpStatus.NO_CONTENT)
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'Successfully acknowledge given activity' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: generateExceptionsTableMarkdown([
      {
        error: new ActivityAcknowledgementNotRequiredException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, 'sample-activity-uuid').getResponse(),
        description: 'The given activity does not require acknowledgement',
      },
      {
        error: new ActivityHadAlreadyBeenAcknowledgedException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, 'sample-activity-uuid').getResponse(),
        description: 'The given activity had already been acknowledged.',
      },
    ]),
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: generateExceptionsTableMarkdown([
      {
        error: new EntityNotFoundException(
          COMPONENT_ERROR_CODE.ACTIVITY_SERVICE,
          Activity.name,
          '(additional query information)',
        ).getResponse(),
        description: 'The given activity was not found or does not belongs to the user',
      },
    ]),
  })
  async acknowledgeActivity(@Param('activityUuid') activityUuid: string, @Req() req: RequestWithCitizenSession) {
    const { userId } = req.session.user;
    return await this.transactionActivityService.acknowledgeActivity(activityUuid, userId);
  }

  @Post('/non-singpass/activity/acknowledge')
  @HttpCode(HttpStatus.NO_CONTENT)
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ description: 'Successfully acknowledge given activity' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: generateExceptionsTableMarkdown([
      {
        error: new ActivityAcknowledgementNotRequiredException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, 'sample-activity-uuid').getResponse(),
        description: 'The given activity does not require acknowledgement',
      },
      {
        error: new ActivityHadAlreadyBeenAcknowledgedException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, 'sample-activity-uuid').getResponse(),
        description: 'The given activity had already been acknowledged.',
      },
    ]),
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: generateExceptionsTableMarkdown([
      {
        error: new EntityNotFoundException(
          COMPONENT_ERROR_CODE.ACTIVITY_SERVICE,
          Activity.name,
          '(additional query information)',
        ).getResponse(),
        description: 'The given activity was not found or does not belongs to the user',
      },
    ]),
  })
  async acknowledgeActivityNonSingpass(@Req() req: NonSingpassContentRetrievalRequest) {
    const { activityUuid, userId } = req.user;
    return await this.transactionActivityService.acknowledgeActivity(activityUuid, userId);
  }

  @Post('/activities/:activityUuid/update-recipient-info')
  @HttpCode(StatusCodes.OK)
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @ApiTags('apigw', 'tech-doc:update recipient info')
  @ApiOperation({
    summary: 'update recipient info.',
    description: 'This API endpoint allows the agency to modify recipient information for a specific transaction.',
  })
  @ApiParam({
    name: 'activityUuid',
    required: true,
    type: String,
    example: 'FSG-xxxxxxxx-xxxxxxxxxxxxxxxx or activity-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
  })
  @ApiBody({ type: UpdateRecipientInfoRequest })
  @ApiOkResponse({
    type: UpdateRecipientInfoResponse,
    description: 'request id',
    status: StatusCodes.OK,
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY })
  @UseInterceptors(AppendTraceIdInterceptor)
  async updateActivityRecipientInfo(
    @Param('activityUuid') activityUuid: string,
    @Req() req: RequestWithProgrammaticSession,
    @Body() body: UpdateRecipientInfoRequest,
  ) {
    return await this.transactionActivityService.updateRecipientInfo(req.session.user.userId, activityUuid, body);
  }

  @Get('/non-singpass/activity')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ type: ActivityDetailsResponse, description: 'Retrieves activity details.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY })
  async retrieveActivityDetailsNonSingpass(@Req() req: NonSingpassContentRetrievalRequest) {
    const { activityUuid, userId } = req.user;
    return await this.transactionActivityService.retrieveActivityDetails(activityUuid, userId);
  }

  @Get('/activities/:activityUuid/retrieval-options')
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiOkResponse({
    type: RetrieveActivityRetrievableOptionsResponse,
    description: 'Get the activity retrieval options',
  })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY })
  async retrieveActivityRetrievableOptions(@Param('activityUuid') activityUuid: string) {
    return await this.transactionActivityService.retrieveActivityRetrievableOptions(activityUuid);
  }

  // ---------------------------------------------------------------------------
  // Email
  // ---------------------------------------------------------------------------
  @Post('email/update-user-email')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, type: UpdateResult, description: 'Updates user email.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY })
  async updateUserEmailForTransactionId(@Body() updateReqBody: UpdateUserEmailForTransactionRequest) {
    return await this.recipientService.updateUserEmailForTransactionId(updateReqBody);
  }

  // ---------------------------------------------------------------------------
  // Transaction Status (For agency and CP) - CP not yet done
  // ---------------------------------------------------------------------------
  @Get('/:transactionUuid/status')
  @ApiTags('apigw', 'tech-doc:transaction status')
  @ApiOperation({
    summary: 'transaction status',
    description: 'This API endpoint enables agencies to query the status of a transaction that has been created.',
  })
  @ApiParam({
    name: 'transactionUuid',
    required: true,
    type: String,
    example: 'transaction-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
    description:
      'The success response from the `create transaction` API will include the Transaction ID as part of the returned information.',
  })
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @ApiOkResponse({ type: TransactionStatusResponse, description: 'Retrieves transaction status.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY, type: ErrorResponse })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_TRANSACTION, type: ErrorResponse })
  async retrieveTransactionStatus(
    @Param('transactionUuid') transactionUuid: string,
    @Req() req: RequestWithProgrammaticSession,
  ): Promise<TransactionStatusResponse> {
    const userId = req.session.user.userId;
    return await this.transactionService.retrieveTransactionStatus(transactionUuid, userId);
  }

  // ---------------------------------------------------------------------------
  // Revocation
  // ---------------------------------------------------------------------------
  @Post('/revocation')
  @ApiTags('apigw', 'tech-doc:revocation')
  @ApiOperation({
    summary: 'revocation.',
    description: 'This API endpoint enables the agency to revoke an OA document issued by the same agency.',
  })
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @UseInterceptors(AppendTraceIdInterceptor)
  @ApiBody({ type: RevokeTransactionRequest })
  @ApiOkResponse({ type: RevokeTransactionResponseDto, description: 'Revokes OA documents' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY, type: ErrorResponse })
  async revokeTransactionOa(@Req() req: RequestWithProgrammaticSession, @Body() body: RevokeTransactionRequest) {
    const userId = req.session.user.userId;

    return await this.revokeTransactionService.createRevokeTransaction(userId, body);
  }
}
