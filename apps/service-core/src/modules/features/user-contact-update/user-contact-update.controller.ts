import {
  ERROR_RESPONSE_DESC,
  OTP_CHANNEL,
  UserContactUpdateSendOtpRequest,
  UserContactUpdateSendOtpResponse,
  UserContactUpdateVerifyOtpRequest,
} from '@filesg/common';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { RequestWithSession } from '../../../typings/common';
import { UserContactUpdateService } from './user-contact-update.service';

@ApiTags('user-contact-update')
@Controller('v1/user-contact-update')
export class UserContactUpdateController {
  private readonly logger = new Logger(UserContactUpdateController.name);

  constructor(private readonly userContactUpdateService: UserContactUpdateService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  @ApiBody({ type: UserContactUpdateSendOtpRequest, description: 'Requests sending of OTP.' })
  @ApiOkResponse({ type: UserContactUpdateSendOtpResponse, description: 'OTP sent' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async sendOtp(@Req() req: RequestWithSession, @Body() body: UserContactUpdateSendOtpRequest) {
    const { email, mobile } = body;

    if (email) {
      return await this.userContactUpdateService.sendOtp(req.session.user.userId, email, OTP_CHANNEL.EMAIL);
    } else if (mobile) {
      return await this.userContactUpdateService.sendOtp(req.session.user.userId, mobile, OTP_CHANNEL.SMS);
    }
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN, requireOnboardedUser: false })
  @ApiBody({ type: UserContactUpdateVerifyOtpRequest, description: 'Verification of OTP.' })
  @ApiOkResponse({ description: 'OTP verified' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async verifyOtp(@Req() req: RequestWithSession, @Body() body: UserContactUpdateVerifyOtpRequest) {
    const { channel, inputOtp } = body;
    return await this.userContactUpdateService.verifyOtp(req.session.user.userId, inputOtp, channel);
  }
}
