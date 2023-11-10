import { AUDIT_EVENT_NAME, AUTH_TYPE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { LoginRequest, MockCorppassLoginRequest } from '../../../dtos/auth/request';
import { AuditEventCreationModel } from '../../../entities/audit-event';
import { User } from '../../../entities/user';
import { FileSGSession } from '../../../typings/common';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
import { CorporateUserEntityService } from '../../entities/user/corporate-user/corporate-user.entity.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MockAuthService {
  private readonly logger = new Logger(MockAuthService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly auditEventEntityService: AuditEventEntityService,
    private readonly citizenUserEntityService: CitizenUserEntityService,
    private readonly corporateUserEntityService: CorporateUserEntityService,
  ) {}

  public async mockNdiLogin(session: FileSGSession, { authCode }: LoginRequest): Promise<void> {
    this.logger.log(`Login user using ndilogin with authcode ${authCode}`);
    const nric = authCode;
    const user = (await this.authService.getOrCreateUserUsingUin(nric)) as User;

    if (!user.isOnboarded) {
      await this.citizenUserEntityService.updateCitizenUserById(user.id, { name: null, email: null, phoneNumber: null });
    }

    await this.authService.updateSession(user, session);
    await this.citizenUserEntityService.updateCitizenUserById(user.id, { lastLoginAt: new Date() });
    this.logger.log(`NRIC extracted ${nric}`);

    const userSessionAuditEventModel: AuditEventCreationModel = {
      eventName: AUDIT_EVENT_NAME.USER_LOGIN,
      subEventName: session.id,
      data: { userId: user.id, authType: AUTH_TYPE.SINGPASS, sessionId: session.id, hasPerformedDocumentAction: false },
    };
    await this.auditEventEntityService.insertAuditEvents([userSessionAuditEventModel]);
  }

  public async mockCorppassLogin(session: FileSGSession, { uin, uen, role }: MockCorppassLoginRequest): Promise<void> {
    this.logger.log(`Login user using mockCorppassLogin with uin ${uin}, uen: ${uen} and role: ${role}`);

    const { corporate, corporateUser } = await this.authService.getOrCreateCorporateAndCorporateUser(uen, uin);
    const accessibleAgencies = await this.authService.handleAgencyNameCaching([role]);

    // update the session with the uin, uen and role
    await this.authService.updateCorporateUserSession(corporate, corporateUser, session, accessibleAgencies);
    await this.corporateUserEntityService.updateCorporateUserById(corporateUser.id, { lastLoginAt: new Date() });

    const userSessionAuditEventModel: AuditEventCreationModel = {
      eventName: AUDIT_EVENT_NAME.USER_LOGIN,
      subEventName: session.id,
      data: { userId: corporateUser.user!.id, authType: AUTH_TYPE.CORPPASS, sessionId: session.id, hasPerformedDocumentAction: false },
    };
    await this.auditEventEntityService.insertAuditEvents([userSessionAuditEventModel]);
  }
}
