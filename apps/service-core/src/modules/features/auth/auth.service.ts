import { ErrorLogLevel, InputValidationException, JWT_TYPE, maskUin, PerformanceTestMethodReturnMock } from '@filesg/backend-common';
import {
  AccessibleAgency,
  AUDIT_EVENT_NAME,
  AUTH_TYPE,
  COMPONENT_ERROR_CODE,
  GetLoginContextResponse,
  isUinfinValid,
  MyInfoComponentUserDetailsResponse,
  MyInfoUserDetailsResponse,
  redactUinfin,
  SSO_ESERVICE,
  STATUS,
  USER_TYPE,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { MyInfo, Util } from '@govtechsg/singpass-myinfo-oidc-helper';
import { NdiOidcHelper } from '@govtechsg/singpass-myinfo-oidc-helper/dist/singpass';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { isAxiosError } from '@nestjs/terminus/dist/utils';
import { addMinutes } from 'date-fns';

import {
  MyInfoException,
  SingpassNonceMatchError,
  UserAlreadyOnboardedException,
  UserInfoFailedToUpdateException,
} from '../../../common/filters/custom-exceptions.filter';
import { MOCK_USER_DETAILS_FROM_MYINFO } from '../../../consts/mocks';
import { LoginRequest, ProgrammaticAuthRequest } from '../../../dtos/auth/request';
import { AuditEventCreationModel } from '../../../entities/audit-event';
import { Corporate } from '../../../entities/corporate';
import { CorporateUser } from '../../../entities/corporate-user';
import { CitizenUser, ProgrammaticUser, User } from '../../../entities/user';
import {
  AuthUser,
  DB_QUERY_ERROR,
  FileSGSession,
  MYINFO_PROVIDER,
  SINGPASS_PROVIDER,
  UserSessionAuditEventData,
} from '../../../typings/common';
import { verifyArgon2Hash } from '../../../utils/encryption';
import { generateUuid, isQueryFailedErrorType } from '../../../utils/helpers';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
import { CorporateEntityService } from '../../entities/user/corporate/corporate.entity.service';
import { CorporateUserEntityService } from '../../entities/user/corporate-user/corporate-user.entity.service';
import { UserEntityService } from '../../entities/user/user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { AgencyClientV2Service } from '../agency-client/agency-client.v2.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly citizenUserEntityService: CitizenUserEntityService,
    private readonly userEntityService: UserEntityService,
    private readonly corporateEntityService: CorporateEntityService,
    private readonly corporateUserEntityService: CorporateUserEntityService,
    private readonly jwtService: JwtService,
    private redisService: RedisService,
    private fileSGConfigService: FileSGConfigService,
    private agencyClientService: AgencyClientV2Service,
    private auditEventEntityService: AuditEventEntityService,
    private readonly agencyEntityService: AgencyEntityService,
    @Inject(SINGPASS_PROVIDER) private singpassHelper: NdiOidcHelper,
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

  async validateProgrammaticUser(clientLoginRequest: ProgrammaticAuthRequest, programmaticUser: ProgrammaticUser): Promise<boolean> {
    const { secret } = clientLoginRequest;

    return programmaticUser.status === STATUS.ACTIVE && (await verifyArgon2Hash(programmaticUser.clientSecret, secret));
  }

  public async generateJWT(payload: Record<string, any>, type: JWT_TYPE, signOptions?: JwtSignOptions): Promise<string> {
    return await this.jwtService.signAsync({ ...payload, type }, signOptions);
  }

  public getLoginContext(): GetLoginContextResponse {
    const { clientId, redirectUrl, authUrl } = this.fileSGConfigService.singpassConfig;
    const state = generateUuid();
    const nonce = generateUuid();
    return {
      url: `${authUrl}?scope=openid&response_type=code&redirect_uri=${redirectUrl}&state=${state}&nonce=${nonce}&client_id=${clientId}`,
    };
  }

  public async ndiLogin(session: FileSGSession, { authCode, nonce }: LoginRequest) {
    const tokens = await this.singpassHelper.getTokens(authCode);
    this.logger.log(`[Singpass] Received Token`);

    const tokenPayload = await this.singpassHelper.getIdTokenPayload(tokens);
    this.logger.log(`[Singpass] Extracted payload from token`);

    if (tokenPayload.nonce !== nonce) {
      throw new SingpassNonceMatchError(COMPONENT_ERROR_CODE.AUTH_SERVICE);
    }

    const { nric, uuid } = this.singpassHelper.extractNricAndUuidFromPayload(tokenPayload);
    this.logger.log(`[Singpass] NRIC: ${maskUin(nric)}, uuid: ${uuid}`);

    const user = await this.getOrCreateUserUsingUin(nric);
    this.logger.log(`User successfully created/retrieved from db`);
    if (!user.isOnboarded) {
      await this.citizenUserEntityService.updateCitizenUserById(user.id, { name: null, email: null, phoneNumber: null });
      this.logger.log(`Resetting user name, email and phone number as he was not onboarded`);
    } else if (!user.name) {
      await this.updateUserNameFromMyInfo(user.id);
      this.logger.log(`Updated username from MyInfo in db`);
    }

    await this.updateSession(user, session);
    await this.citizenUserEntityService.updateCitizenUserById(user.id, { lastLoginAt: new Date() });
    await this.saveUserLoginAuditEvent({
      userId: user.id,
      authType: AUTH_TYPE.SINGPASS,
      sessionId: session.id,
      hasPerformedDocumentAction: false,
    });
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

  async getOrCreateUserUsingUin(nric: string) {
    if (!isUinfinValid(nric)) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AUTH_SERVICE, 'Invalid UIN');
    }

    const user = await this.userEntityService.retrieveUserByUin(nric, { toThrow: false });

    if (user) {
      return user;
    }

    return await this.citizenUserEntityService.saveCitizenUser({ uin: nric, status: STATUS.ACTIVE });
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

  public async updateUserNameFromMyInfo(userId: number) {
    try {
      const { name } = await this.getUserDetailsFromMyInfo(userId);
      await this.citizenUserEntityService.updateCitizenUserById(userId, { name });
    } catch (err) {
      if (!(err instanceof MyInfoException)) {
        this.logger.error(`Failed to update username from myinfo for user id ${userId}.ErrorThrown: ${redactUinfin(JSON.stringify(err))}`);
      }
    }
  }

  @PerformanceTestMethodReturnMock({ value: MOCK_USER_DETAILS_FROM_MYINFO })
  public async getUserDetailsFromMyInfo(userId: number): Promise<MyInfoUserDetailsResponse> {
    const { uin } = await this.citizenUserEntityService.retrieveCitizenUserById(userId);
    const maskedUin = maskUin(uin!);
    const { attributes } = this.fileSGConfigService.myinfoConfig;

    this.logger.log(`[MyInfo] Trying to retrieve user[${maskedUin}] attributes [${attributes.toString()}]`);

    try {
      const myInfoUserDetails = await this.myInfoHelper.getPersonBasic(uin!, attributes);
      this.logger.log(`[MyInfo] Data retrieval complete for user ${maskedUin}`);

      const { name, email, mobileno } = myInfoUserDetails;

      const userDetailsResponse: MyInfoUserDetailsResponse = {
        name: name?.value || null,
        email: email?.value || null,
        phoneNumber: `${mobileno?.prefix?.value}${mobileno?.areacode?.value}${mobileno?.nbr?.value}` || null,
      };

      return userDetailsResponse;
    } catch (err) {
      const errorLogLevel: ErrorLogLevel = isAxiosError(err) && err.response?.status === HttpStatus.NOT_FOUND ? 'warn' : 'error';
      const internalLog = `ErrorThrown: ${redactUinfin(JSON.stringify(err))}`;
      throw new MyInfoException(COMPONENT_ERROR_CODE.AUTH_SERVICE, maskedUin, errorLogLevel, internalLog);
    }
  }

  public async updateUserDetailsFromMyInfo(authUser: AuthUser): Promise<MyInfoComponentUserDetailsResponse> {
    // Check if onboarded
    if (authUser.isOnboarded) {
      throw new UserAlreadyOnboardedException(COMPONENT_ERROR_CODE.AUTH_SERVICE);
    }

    const { name, email, phoneNumber } = await this.getUserDetailsFromMyInfo(authUser.userId);
    return await this.updateUserDetailUsingExternalSourceData(authUser, { name, email, phoneNumber });
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

  public async icaSso(token: string, session: FileSGSession) {
    // NOTE: Will overwrite previous user session
    const uin = await this.agencyClientService.retrieveUinFromMyIca(token);
    this.logger.log(`SSO for ICA user with id: ${maskUin(uin)}`);
    const user = await this.getOrCreateUserUsingUin(uin);

    // Remove previous MyInfo details if user not onboarded
    if (!user.isOnboarded) {
      await this.citizenUserEntityService.updateCitizenUserById(user.id, { name: null, email: null, phoneNumber: null });
    }

    await this.updateSession(user, session, SSO_ESERVICE.MY_ICA);
    await this.saveUserLoginAuditEvent({
      userId: user.id,
      authType: AUTH_TYPE.SINGPASS_SSO,
      sessionId: session.id,
      ssoEservice: SSO_ESERVICE.MY_ICA,
      hasPerformedDocumentAction: false,
    });
  }

  public async updateUserFromMcc(authUser: AuthUser): Promise<MyInfoComponentUserDetailsResponse> {
    // Check if onboarded
    if (authUser.isOnboarded) {
      throw new UserAlreadyOnboardedException(COMPONENT_ERROR_CODE.AUTH_SERVICE);
    }

    const { uin } = await this.citizenUserEntityService.retrieveCitizenUserById(authUser.userId);
    const {
      personalInfo: { personSurname, personName },
      contactInfo: { contactEmailAddr: email, contactMobileNo },
    } = await this.agencyClientService.retrieveUserInfoFromMcc(uin!); // Citizen user will have uin

    const name = `${personSurname} ${personName}`.trim(); // Surname may return empty string
    const phoneNumber = contactMobileNo?.replaceAll('|', ''); // contactMobileNo returns null, different for API spec (empty string)
    return await this.updateUserDetailUsingExternalSourceData(authUser, { name, email, phoneNumber });
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

  private async updateUserDetailUsingExternalSourceData(
    authUser: AuthUser,
    { name, email, phoneNumber }: Partial<CitizenUser>,
  ): Promise<MyInfoComponentUserDetailsResponse> {
    await this.citizenUserEntityService.updateCitizenUserById(authUser.userId, { name, phoneNumber });
    if (name) {
      authUser.name = name;
    }

    let duplicateEmail = null;
    if (email) {
      try {
        await this.citizenUserEntityService.updateCitizenUserById(authUser.userId, { email });
      } catch (error: unknown) {
        if (isQueryFailedErrorType(error, DB_QUERY_ERROR.DuplicateEntryError)) {
          duplicateEmail = email!;
        } else {
          const internalLog = `Failed to update email: ${email} for the user: ${authUser.userId}. Thrown Error: ${JSON.stringify(error)}`;
          throw new UserInfoFailedToUpdateException(COMPONENT_ERROR_CODE.AUTH_SERVICE, internalLog);
        }
      }
    }
    return { duplicateEmail };
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
