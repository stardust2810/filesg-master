import { InputValidationException, maskUin } from '@filesg/backend-common';
import {
  AccessibleAgency,
  AUDIT_EVENT_NAME,
  COMPONENT_ERROR_CODE,
  GetLoginContextResponse,
  isUinfinValid,
  redactUinfin,
  SSO_ESERVICE,
  STATUS,
  USER_TYPE,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { MyInfo, Util } from '@govtechsg/singpass-myinfo-oidc-helper';
import { NdiOidcHelper } from '@govtechsg/singpass-myinfo-oidc-helper/dist/corppass';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { addMinutes } from 'date-fns';

import { SingpassNonceMatchError } from '../../../common/filters/custom-exceptions.filter';
import { LoginRequest } from '../../../dtos/auth/request';
import { AuditEventCreationModel } from '../../../entities/audit-event';
import { Corporate } from '../../../entities/corporate';
import { CorporateUser } from '../../../entities/corporate-user';
import { User } from '../../../entities/user';
import { CORPPASS_PROVIDER, FileSGSession, MYINFO_PROVIDER, UserSessionAuditEventData } from '../../../typings/common';
import { generateUuid } from '../../../utils/helpers';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
import { CorporateEntityService } from '../../entities/user/corporate/corporate.entity.service';
import { CorporateUserEntityService } from '../../entities/user/corporate-user/corporate-user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class CorppassAuthService {
  private readonly logger = new Logger(CorppassAuthService.name);
  constructor(
    private readonly citizenUserEntityService: CitizenUserEntityService,
    private readonly corporateEntityService: CorporateEntityService,
    private readonly corporateUserEntityService: CorporateUserEntityService,
    private redisService: RedisService,
    private fileSGConfigService: FileSGConfigService,
    private auditEventEntityService: AuditEventEntityService,
    private readonly agencyEntityService: AgencyEntityService,
    @Inject(CORPPASS_PROVIDER) private corppassHelper: NdiOidcHelper,
    @Inject(MYINFO_PROVIDER) private myInfoHelper: MyInfo.Helper,
  ) {
    Util.LoggerUtil.setLogger({
      error: (msg) => this.logger.error(redactUinfin(msg)),
      log: (msg) => this.logger.log(redactUinfin(msg)),
      info: (msg) => this.logger.log(redactUinfin(msg)),
      warn: (msg) => this.logger.warn(redactUinfin(msg)),
      debug: (msg) => this.logger.debug(redactUinfin(msg)),
      trace: (msg) => this.logger.verbose(redactUinfin(msg)),
    });
  }

  public getLoginContext(): GetLoginContextResponse {
    const { clientId, redirectUrl, authUrl } = this.fileSGConfigService.corppassConfig;
    const state = generateUuid();
    const nonce = generateUuid();
    return {
      url: `${authUrl}?scope=openid&response_type=code&redirect_uri=${redirectUrl}&state=${state}&nonce=${nonce}&client_id=${clientId}`,
    };
  }

  public async ndiLogin(session: FileSGSession, { authCode, nonce }: LoginRequest) {
    const tokens = await this.corppassHelper.getTokens(authCode);
    this.logger.log(`[Corppass] Received Token`);

    const tokenPayload = await this.corppassHelper.getIdTokenPayload(tokens);
    this.logger.log(`[Corppass] Extracted payload from token`);

    if (tokenPayload.nonce !== nonce) {
      throw new SingpassNonceMatchError(COMPONENT_ERROR_CODE.AUTH_SERVICE);
    }

    const payload = this.corppassHelper.extractInfoFromIdTokenSubject(tokenPayload);
    this.logger.log(`[Corppass] Extracted Info from payload`, payload);
  }

  async updateSession(user: User, session: FileSGSession, ssoEservice?: SSO_ESERVICE) {
    this.logger.log(`Creating session for user ${user.id}|${user.uuid}|${user.name}`);
    const { sessionLengthInSecs, extendSessionWarningDurationInSecs, absoluteSessionExpiryInMins } = this.fileSGConfigService.sessionConfig;

    await this.redisService.set(FILESG_REDIS_CLIENT.USER, user.uuid, session.id);

    const currentTime = new Date();

    session.user = {
      userId: user.id,
      userUuid: user.uuid,
      type: USER_TYPE.CITIZEN,
      name: user.name,
      maskedUin: maskUin(user.uin!),
      role: user.role,
      isOnboarded: user.isOnboarded,
      lastLoginAt: user.lastLoginAt,
      createdAt: currentTime,
      expiresAt: addMinutes(currentTime, absoluteSessionExpiryInMins),
      sessionLengthInSecs,
      extendSessionWarningDurationInSecs,
      ssoEservice: ssoEservice ?? null,
      hasPerformedDocumentAction: false,
      corporateUen: null,
      corporateName: null,
      accessibleAgencies: null,
    };
    this.logger.log(`Session created for user ${user.id}|${user.uuid}|${user.name}`);
  }

  async updateCorporateUserSession(
    corporate: Corporate,
    corporateUser: CorporateUser,
    session: FileSGSession,
    accessibleAgencies: AccessibleAgency[],
  ) {
    const { user, lastLoginAt } = corporateUser;
    const { id, uuid, role } = user!;

    this.logger.log(`Creating session for corporate user with base user info of ${id}|${uuid}`);
    const { sessionLengthInSecs, extendSessionWarningDurationInSecs, absoluteSessionExpiryInMins } = this.fileSGConfigService.sessionConfig;

    await this.redisService.set(FILESG_REDIS_CLIENT.USER, uuid, session.id);

    const currentTime = new Date();

    session.user = {
      userId: id,
      userUuid: uuid,
      type: USER_TYPE.CORPORATE_USER,
      maskedUin: maskUin(corporateUser.uin),
      name: corporateUser.name,
      role: role,
      isOnboarded: null,
      lastLoginAt,
      createdAt: currentTime,
      expiresAt: addMinutes(currentTime, absoluteSessionExpiryInMins),
      sessionLengthInSecs,
      extendSessionWarningDurationInSecs,
      ssoEservice: null,
      hasPerformedDocumentAction: false,
      corporateUen: corporate.uen,
      corporateName: corporate.name,
      accessibleAgencies,
    };
    this.logger.log(`Session created for corporate user with base user info of ${id}|${uuid}`);
  }

  // gd TODO: unit test to be done when proper login implemented in case any changes
  public async getOrCreateCorporateAndCorporateUser(uen: string, uin: string) {
    if (!isUinfinValid(uin)) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AUTH_SERVICE, 'Invalid UIN');
    }

    let corporate: Corporate | null = null;
    let corporateUser: CorporateUser | null;

    // check if corporate user exists with the uen, create if not
    corporate = await this.corporateEntityService.retrieveCorporateByUen(uen, { toThrow: false });

    if (!corporate) {
      corporate = await this.corporateEntityService.saveCorporateWithBaseUser({ uen, user: { status: STATUS.ACTIVE } });
    }

    // check if corppass user exists with the uin and uen, create if not
    corporateUser = await this.corporateUserEntityService.retrieveCorporateUserWithBaseUserByUinAndCorporateId(uin, corporate.id, {
      toThrow: false,
    });

    if (!corporateUser) {
      corporateUser = await this.corporateUserEntityService.saveCorporateUserWithBaseUser({
        uin,
        corporate,
        user: { status: STATUS.ACTIVE },
      });
    }

    return { corporate, corporateUser };
  }

  public async citizenLogout(id: number, session: FileSGSession) {
    this.logger.log(`Logging out citizen with id: ${id} and session ${session.id}`);

    // Remove previous MyInfo details if user not onboarded
    const isOnboarded = session.user.isOnboarded;
    if (!isOnboarded) {
      await this.citizenUserEntityService.updateCitizenUserById(id, { name: null, email: null, phoneNumber: null });
    }

    session.destroy((err: any) => {
      if (err) {
        this.logger.warn(`Was unable to destroy session. Thrown Error: ${JSON.stringify(err)}`);
      }
    });
    await this.redisService.del(FILESG_REDIS_CLIENT.USER, id.toString());
  }

  // gd TODO: unit test to be done when proper login implemented in case any changes
  public async handleAgencyNameCaching(roles: string[]): Promise<AccessibleAgency[]> {
    const agencyCodes = roles; // assuming these are roles gotten from corppass login

    const accessibleAgencies: AccessibleAgency[] = [];
    const agencyCodesNotInRedis: string[] = [];

    // update company particular icon in profile page
    const hasAllAgenciesRole = agencyCodes.some((code) => code.toLocaleLowerCase() === 'all');

    if (hasAllAgenciesRole) {
      accessibleAgencies.push({ code: 'ALL', name: 'All government agencies' });
      return accessibleAgencies;
    }

    const agencyNamesFromRedis = await this.redisService.mget(FILESG_REDIS_CLIENT.CORPPASS_AGENCY, agencyCodes);

    agencyNamesFromRedis.forEach((name, index) => {
      if (name !== null) {
        accessibleAgencies.push({ name, code: agencyCodes[index] });
      } else {
        agencyCodesNotInRedis.push(agencyCodes[index]);
      }
    });

    if (agencyCodesNotInRedis.length > 0) {
      const agencies = await this.agencyEntityService.retrieveAgenciesByCodes(agencyCodesNotInRedis);

      const agencyCodesFromDb = agencies.map(({ code }) => code);
      const unknownAgencyCodes = agencyCodesNotInRedis.filter((code) => !agencyCodesFromDb.includes(code));

      if (unknownAgencyCodes.length > 0) {
        this.logger.error(`Unknown agency code(s) ${unknownAgencyCodes.join(', ')} assigned to user.`);
      }

      const promises = agencies.map(({ code, name }) => {
        accessibleAgencies.push({ code, name });

        // use set with loop instead of mset because mset does not support setting of expiration
        return this.redisService.set(
          FILESG_REDIS_CLIENT.CORPPASS_AGENCY,
          code,
          name,
          undefined,
          this.fileSGConfigService.authConfig.corppassAgencyCacheExpirySeconds,
        );
      });

      await Promise.allSettled(promises);
    }

    return accessibleAgencies.sort((a, b) => a.code.localeCompare(b.code));
  }

  private async saveUserLoginAuditEvent(data: UserSessionAuditEventData) {
    const userSessionAuditEventModel: AuditEventCreationModel = {
      eventName: AUDIT_EVENT_NAME.USER_LOGIN,
      subEventName: data.sessionId,
      data,
    };
    await this.auditEventEntityService.insertAuditEvents([userSessionAuditEventModel]);
  }
}
