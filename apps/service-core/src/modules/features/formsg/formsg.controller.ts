import { InputValidationException } from '@filesg/backend-common';
import {
  COMPONENT_ERROR_CODE,
  CreateFileTransactionResponse,
  CreateFormSgFileTransactionRequest,
  CreateFormSgRecallTransactionRequest,
  ERROR_RESPONSE_DESC,
  ErrorResponse,
  RecallTransactionResponse,
  ROLE,
} from '@filesg/common';
import { Body, Controller, Logger, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { AppendTraceIdInterceptor } from '../../../common/interceptors/append-trace-id.interceptor';
import { FormSgTransactionService } from './formsg-transaction.service';

@ApiTags('formsg')
@Controller('v1/formsg')
export class FormSgController {
  private readonly logger = new Logger(FormSgController.name);

  constructor(private readonly formsgTransactionService: FormSgTransactionService) {}

  @Post('transaction/issuance/single')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_SYSTEM_INTEGRATION] })
  @ApiBody({ type: CreateFormSgFileTransactionRequest })
  @ApiOkResponse({
    type: CreateFileTransactionResponse,
    description:
      'Returns a JSON object which contains the authorization access token (JWT) that will be used to upload the document to FileSG.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY, type: ErrorResponse })
  @UseInterceptors(AppendTraceIdInterceptor)
  async createFormSgFileTransaction(@Body() body: CreateFormSgFileTransactionRequest) {
    return await this.formsgTransactionService.createFormSgTransaction(body);
  }

  @Post('transaction/issuance/batch')
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  async createFormSgTransactionIssuanceBatch() {
    return `Batch Issuance endpoint call success`;
  }

  @Post('transaction/recall/:transactionUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_SYSTEM_INTEGRATION] })
  @ApiBody({ type: CreateFormSgRecallTransactionRequest })
  @ApiOkResponse({
    type: RecallTransactionResponse,
    description: 'Returns the transaction uuid for the recall transaction',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY, type: ErrorResponse })
  @UseInterceptors(AppendTraceIdInterceptor)
  async createFormSgRecallTransaction(
    @Param('transactionUuid') transactionUuid: string,
    @Body() { requestorEmail }: CreateFormSgRecallTransactionRequest,
  ) {
    if (transactionUuid === '' || transactionUuid === ':transactionUuid') {
      throw new InputValidationException(COMPONENT_ERROR_CODE.FORMSG_SERVICE, `Transaction Uuid and RequestorEmail cannot be empty`);
    }

    return await this.formsgTransactionService.recallTransaction(transactionUuid, requestorEmail);
  }
}
