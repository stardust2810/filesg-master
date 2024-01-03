import { InputValidationException, maskUin } from '@filesg/backend-common';
import {
  AccessibleAgency,
  AUDIT_EVENT_NAME,
  COMPONENT_ERROR_CODE,
  GetLoginContextResponse,
  isUinfinValid,
  redactUinfin,
  STATUS,
  USER_TYPE,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Util } from '@govtechsg/singpass-myinfo-oidc-helper';
import { NdiOidcHelper } from '@govtechsg/singpass-myinfo-oidc-helper/dist/corppass';
import { createClientAssertion } from '@govtechsg/singpass-myinfo-oidc-helper/dist/util/SigningUtil';
import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createPrivateKey } from 'crypto';
import { addMinutes } from 'date-fns';
import * as Jose from 'jose';

import { CorppassNonceMatchError } from '../../../common/filters/custom-exceptions.filter';
import { LoginRequest } from '../../../dtos/auth/request';
import { AuditEventCreationModel } from '../../../entities/audit-event';
import { Corporate } from '../../../entities/corporate';
import { CorporateUser } from '../../../entities/corporate-user';
import { CORPPASS_PROVIDER, CorppassAuthInfoPayload, FileSGCorporateUserSession, UserSessionAuditEventData } from '../../../typings/common';
import { generateUuid } from '../../../utils/helpers';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { CorporateEntityService } from '../../entities/user/corporate/corporate.entity.service';
import { CorporateUserEntityService } from '../../entities/user/corporate-user/corporate-user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';

const AGENCY_CACHE_REDIS_KEY = 'AgencyCode';

@Injectable()
export class CorppassAuthService {
  private readonly logger = new Logger(CorppassAuthService.name);
  constructor(
    private readonly corporateEntityService: CorporateEntityService,
    private readonly corporateUserEntityService: CorporateUserEntityService,
    private redisService: RedisService,
    private fileSGConfigService: FileSGConfigService,
    private auditEventEntityService: AuditEventEntityService,
    private readonly agencyEntityService: AgencyEntityService,
    @Inject(CORPPASS_PROVIDER) private corppassHelper: NdiOidcHelper,
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

  public async getLoginContext(): Promise<GetLoginContextResponse> {
    const { clientId, redirectUrl, authUrl } = this.fileSGConfigService.corppassConfig;

    const state = generateUuid();
    const nonce = generateUuid();

    return {
      url: `${authUrl}?scope=openid&response_type=code&redirect_uri=${redirectUrl}&state=${state}&nonce=${nonce}&client_id=${clientId}`,
    };
  }

  public async ndiLogin(session: FileSGCorporateUserSession, { authCode, nonce }: LoginRequest) {
    this.logger.log(`[Corppass] Retrieving tokens using auth code ${authCode}`);

    try {
      /**********************
       * Testing code start
       *********************/

      const { openIdDiscoveryUrl, clientId, redirectUrl } = this.fileSGConfigService.corppassConfig;
      const {
        encPrivateKey: encPrivateKeyPEM,
        sigPrivateKey: sigPrivateKeyPEM,
        sigPublicKid,
        encPublicKid,
      } = this.fileSGConfigService.authConfig;
      this.logger.log(`[Corppass] Retrieving get token endpoint and issuer`);

      const {
        data: { issuer, token_endpoint },
      } = await axios.get(openIdDiscoveryUrl);

      this.logger.log(`[Corppass] Token endpoint received ${token_endpoint} with issuer ${issuer}`);

      const ALGO = 'ES512';
      const KEY_FORMAT = 'json';

      const sigPrivKey = createPrivateKey(sigPrivateKeyPEM);
      const signPrivJWK = await Jose.exportJWK(sigPrivKey);
      signPrivJWK.kid = sigPublicKid;
      signPrivJWK.use = 'sig';
      signPrivJWK.alg = ALGO;

      const encPrivKey = createPrivateKey(encPrivateKeyPEM);
      const encPrivJWK = await Jose.exportJWK(encPrivKey);
      encPrivJWK.kid = encPublicKid;
      encPrivJWK.use = 'enc';
      encPrivJWK.alg = 'ECDH-ES+A256KW';

      const assertion = await createClientAssertion({
        issuer: clientId,
        subject: clientId,
        audience: issuer,
        key: { key: JSON.stringify(signPrivJWK), alg: ALGO, format: KEY_FORMAT },
      });
      this.logger.log(`Assertion-------------, ${assertion}`);
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: clientId,
        redirect_uri: redirectUrl,
        client_assertion_type: 'urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer',
        client_assertion: assertion,
      });

      const body = params.toString();

      this.logger.log(`[Corppass] Getting tokens with params ${body}`);

      const response = await axios
        .post(token_endpoint, body, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
        .catch((error) => {
          this.logger.error(JSON.stringify(error));
          if (error.response) {
            this.logger.error(error.response.data); // => the response payload
          }
          throw error;
        });

      this.logger.log(`[Corppass] Token retrieval successful with token: ${JSON.stringify(response)}`);

      /**********************
       * Testing code end
       *********************/

      const token = await this.corppassHelper.getTokens(authCode);
      this.logger.log(`[Corppass] Received Token`);

      this.getCorporateUserRoles(token.access_token);

      const tokenPayload = await this.corppassHelper.getIdTokenPayload(token);
      this.logger.log(`[Corppass] Extracted payload from token`);

      if (tokenPayload.nonce !== nonce) {
        throw new CorppassNonceMatchError(COMPONENT_ERROR_CODE.AUTH_SERVICE);
      }

      const payload = this.corppassHelper.extractInfoFromIdTokenSubject(tokenPayload);
      this.logger.log(`[Corppass] Extracted Info from payload`, payload);
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      if ((error as any).response) {
        this.logger.error((error as any).response.data); // => the response payload
      }
      throw error;
    }
  }

  async updateCorporateUserSession(
    corporate: Corporate,
    corporateUser: CorporateUser,
    session: FileSGCorporateUserSession,
    accessibleAgencies: AccessibleAgency[],
  ) {
    const { user, lastLoginAt } = corporateUser;
    const { id, uuid, role, isOnboarded } = user!;

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
      isOnboarded,
      lastLoginAt,
      createdAt: currentTime,
      expiresAt: addMinutes(currentTime, absoluteSessionExpiryInMins),
      sessionLengthInSecs,
      extendSessionWarningDurationInSecs,
      hasPerformedDocumentAction: false,
      corporateUen: corporate.uen,
      corporateName: corporate.name,
      corporateBaseUserId: corporate.user!.id,
      corporateBaseUserUuid: corporate.user!.uuid,
      accessibleAgencies,
    };
    this.logger.log(`Session created for corporate user with base user info of ${id}|${uuid}`);
  }

  // gd TODO: unit test to be done when proper login implemented in case any changes
  // TODO: determine when to update isOnboarded to true
  public async getOrCreateCorporateAndCorporateUser(uen: string, uin: string) {
    if (!isUinfinValid(uin)) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AUTH_SERVICE, 'Invalid UIN');
    }

    let corporate: Corporate | null = null;
    let corporateUser: CorporateUser | null;

    // check if corporate user exists with the uen, create if not
    corporate = await this.corporateEntityService.retrieveCorporateWithBaseUserByUen(uen, { toThrow: false });

    if (!corporate) {
      corporate = await this.corporateEntityService.saveCorporateWithBaseUser({ uen, user: { status: STATUS.ACTIVE, isOnboarded: true } });
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

  public async logout(id: number, session: FileSGCorporateUserSession) {
    this.logger.log(`Logging out corporate user with id: ${id} and session ${session.id}`);

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

    const agencyNamesFromRedis = await this.redisService.mget(
      FILESG_REDIS_CLIENT.CORPPASS_AGENCY,
      agencyCodes.map((code) => `{${AGENCY_CACHE_REDIS_KEY}}${code}`),
    );

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

        /**
         * Use set with loop instead of mset because mset does not support setting of expiration.
         * Tagging the redis key because if not tagged, during insertion the record will be inserted into different nodes in
         * redis clusters, which results in failure when trying to do mget operation which requires all keys to be retrieved to be
         * in the same node. Hence, with tagging on the key, records will be inserted into the same node thus allowing mget.
         */
        return this.redisService.set(
          FILESG_REDIS_CLIENT.CORPPASS_AGENCY,
          `{${AGENCY_CACHE_REDIS_KEY}}${code}`,
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

  private async getCorporateUserRoles(accessToken: string) {
    const { authInfoUrl } = this.fileSGConfigService.corppassConfig;
    this.logger.log(`[Corppass] Extracting user auth info`);
    // TODO: FIX TYPINGS OF CorppassAuthInfoPayload
    const { data } = await axios.post<CorppassAuthInfoPayload>(authInfoUrl, null, { headers: { Authorization: `Bearer ${accessToken}` } });
    this.logger.log(`[Corppass] User auth info`, data);
  }
}
