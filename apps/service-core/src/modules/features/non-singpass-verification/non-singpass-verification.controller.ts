import {
  ERROR_RESPONSE_DESC,
  Send2FaOtpNonSingpassRequest,
  Send2FaOtpNonSingpassResponse,
  Verify1FaNonSingpassRequest,
  Verify1FaNonSingpassResponse,
  Verify2FaOtpNonSingpassRequest,
  Verify2FaOtpNonSingpassResponse,
} from '@filesg/common';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { JwtNonSingpass2faAuthGuard } from '../../../common/guards/jwt-non-singpass-2fa.guard';
import { SWAGGER_AUTH_NAME } from '../../../consts';
import { NonSingpass2FaRequest } from '../../../typings/common';
import { NonSingpassVerificationService } from './non-singpass-verification.service';

@ApiTags('non-singpass-verification')
@Controller('v1/non-singpass-verification')
export class NonSingpassVerificationController {
  private readonly logger = new Logger(NonSingpassVerificationController.name);

  constructor(private readonly nonSingpassVerificationService: NonSingpassVerificationService) {}

  @Post('verify-1fa')
  @HttpCode(HttpStatus.OK)
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiBody({ type: Verify1FaNonSingpassRequest })
  @ApiOkResponse({ type: Verify1FaNonSingpassResponse, description: 'Validate 1FA credentials to get jwt for 2FA' })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_ACTIVITY })
  async verify1Fa(@Body() body: Verify1FaNonSingpassRequest) {
    const { activityUuid, uin, dob } = body;
    return await this.nonSingpassVerificationService.verify1Fa(activityUuid, uin, dob);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtNonSingpass2faAuthGuard)
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_2FA)
  @ApiOkResponse({ type: Send2FaOtpNonSingpassResponse, description: 'OTP sent' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  async sendOtpFor2Fa(@Req() req: NonSingpass2FaRequest, @Body() { channel }: Send2FaOtpNonSingpassRequest) {
    return await this.nonSingpassVerificationService.sendOtpFor2Fa(req.user.activityUuid, channel);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtNonSingpass2faAuthGuard)
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_2FA)
  @ApiBody({ type: Verify2FaOtpNonSingpassRequest })
  @ApiOkResponse({ type: Verify2FaOtpNonSingpassResponse, description: 'OTP verified' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  async verifyOtpFor2Fa(@Req() req: NonSingpass2FaRequest, @Body() { inputOtp }: Verify2FaOtpNonSingpassRequest) {
    return await this.nonSingpassVerificationService.verifyOtpFor2Fa(req.user.activityUuid, inputOtp);
  }
}
