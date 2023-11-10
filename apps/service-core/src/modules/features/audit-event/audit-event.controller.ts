import { AUDIT_EVENT_NAME, AUTH_TYPE, UserFilesNonSingpassAuditEventRequest, UserFilesSingpassAuditEventRequest } from '@filesg/common';
import { Body, Controller, HttpCode, HttpStatus, Logger, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { JwtNonSingpassContentRetrievalAuthGuard } from '../../../common/guards/jwt-non-singpass-content-retrieval.guard';
import { NonSingpassContentRetrievalRequest, RequestWithSession, UserSessionAuditEventData } from '../../../typings/common';
import { AuditEventService } from './audit-event.service';

@ApiTags('audit-event')
@Controller('v1/audit-event')
export class AuditEventController {
  private readonly logger = new Logger(AuditEventController.name);

  constructor(private readonly auditEventService: AuditEventService) {}

  @Post('non-singpass/files/:eventName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  async userFilesNonSingpassAuditEvent(
    @Param('eventName') eventName: AUDIT_EVENT_NAME,
    @Body() { fileAssetUuids, hasPerformedDocumentAction }: UserFilesNonSingpassAuditEventRequest,
    @Req() req: NonSingpassContentRetrievalRequest,
  ) {
    await this.auditEventService.saveUserFilesAuditEvent(eventName, fileAssetUuids, {
      authType: AUTH_TYPE.NON_SINGPASS,
      userId: req.user.userId,
      sessionId: req.user.sessionId,
      hasPerformedDocumentAction,
    });
  }

  @Post('files/:eventName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  async userFilesSingpassAuditEvent(
    @Param('eventName') eventName: AUDIT_EVENT_NAME,
    @Body() { fileAssetUuids }: UserFilesSingpassAuditEventRequest,
    @Req() req: RequestWithSession,
  ) {
    const { userId, ssoEservice, hasPerformedDocumentAction } = req.session.user;

    const userSessionAuditEventData: UserSessionAuditEventData = ssoEservice
      ? {
          sessionId: req.session.id,
          authType: AUTH_TYPE.SINGPASS_SSO,
          userId,
          ssoEservice: ssoEservice,
          hasPerformedDocumentAction,
        }
      : {
          sessionId: req.session.id,
          authType: AUTH_TYPE.SINGPASS,
          userId,
          hasPerformedDocumentAction,
        };

    await this.auditEventService.saveUserFilesAuditEvent(eventName, fileAssetUuids, userSessionAuditEventData, req.session);
  }
}
