import {
  CreateFileTransactionResponse,
  CreateFileTransactionV2Request,
  ERROR_RESPONSE_DESC,
  ErrorResponse,
  RecallTransactionRequest,
  RecallTransactionResponse,
  ROLE,
} from '@filesg/common';
import { Body, Controller, Delete, Logger, Param, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { AppendTraceIdInterceptor } from '../../../common/interceptors/append-trace-id.interceptor';
import { RequestWithSession } from '../../../typings/common';
import { FileTransactionV2Service } from './file-transaction.v2.service';
import { RecallTransactionService } from './recall-transaction.service';

@ApiTags('transaction-v2')
@Controller('v2/transaction')
export class TransactionV2Controller {
  private readonly logger = new Logger(TransactionV2Controller.name);

  constructor(
    private readonly fileTransactionV2Service: FileTransactionV2Service,
    private readonly recallTransactionService: RecallTransactionService,
  ) {}

  @Post('file/client')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @ApiTags('apigw', 'tech-doc:issuance')
  @ApiOperation({
    summary: 'create transaction (v2).',
    description:
      'This API endpoint enables agencies to initiate a transaction request.\n\n Version2 allows multiple notification channels with templates',
  })
  @ApiBody({ type: CreateFileTransactionV2Request })
  @ApiOkResponse({
    type: CreateFileTransactionResponse,
    description:
      'Returns a JSON object which contains the authorization access token (JWT) that will be used to upload the document to FileSG.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY, type: ErrorResponse })
  @UseInterceptors(AppendTraceIdInterceptor)
  async createFileTransactionForProgrammaticUser(@Req() req: RequestWithSession, @Body() body: CreateFileTransactionV2Request) {
    return this.fileTransactionV2Service.createFileTransaction(req.session.user.userId, body);
  }

  @Delete('/recall/:transactionUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @ApiOkResponse({
    type: RecallTransactionResponse,
    description: 'Returns the transaction uuid for the recall transaction',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY, type: ErrorResponse })
  @UseInterceptors(AppendTraceIdInterceptor)
  async recallTransaction(
    @Param('transactionUuid') transactionUuid: string,
    @Body() recallTransactionRequest: RecallTransactionRequest,
    @Req() req: RequestWithSession,
  ) {
    const eserviceUserId = req.session.user.userId;
    return await this.recallTransactionService.recallTransaction(transactionUuid, eserviceUserId, recallTransactionRequest);
  }
}
