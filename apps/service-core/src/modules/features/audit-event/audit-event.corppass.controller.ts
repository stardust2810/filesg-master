import { AUTH_TYPE, UserFilesAuditEventParams, UserFilesCorppassAuditEventRequest } from '@filesg/common';
import { Body, Controller, HttpCode, HttpStatus, Logger, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { RequestWithCorporateUserSession, UserSessionAuditEventData } from '../../../typings/common';
import { AuditEventService } from './audit-event.service';

@ApiTags('audit-event')
@Controller('v1/audit-event/corppass')
export class CorppassAuditEventController {
  private readonly logger = new Logger(CorppassAuditEventController.name);

  constructor(private readonly auditEventService: AuditEventService) {}

  @Post('files/:eventName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  async userFilesCorppassAuditEvent(
    @Param() { eventName }: UserFilesAuditEventParams,
    @Body() { fileAssetUuids }: UserFilesCorppassAuditEventRequest,
    @Req() req: RequestWithCorporateUserSession,
  ) {
    const {
      user: { userId, hasPerformedDocumentAction, corporateBaseUserId },
      id: sessionId,
    } = req.session;

    const userSessionAuditEventData: UserSessionAuditEventData = {
      sessionId,
      authType: AUTH_TYPE.CORPPASS,
      userId,
      hasPerformedDocumentAction,
      corporateId: corporateBaseUserId,
    };

    await this.auditEventService.saveUserFilesAuditEvent(eventName, fileAssetUuids, userSessionAuditEventData, req.session);
  }
}
