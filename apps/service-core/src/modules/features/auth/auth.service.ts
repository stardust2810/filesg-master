import { ErrorLogLevel, InputValidationException, JWT_TYPE, maskUin, PerformanceTestMethodReturnMock } from '@filesg/backend-common';
import {
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
import { CitizenUser, ProgrammaticUser } from '../../../entities/user';
import {
  AuthUser,
  DB_QUERY_ERROR,
  FileSGCitizenSession,
  MYINFO_PROVIDER,
  SINGPASS_PROVIDER,
  UserSessionAuditEventData,
} from '../../../typings/common';
import { verifyArgon2Hash } from '../../../utils/encryption';
import { generateUuid, isQueryFailedErrorType } from '../../../utils/helpers';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { AgencyClientV2Service } from '../agency-client/agency-client.v2.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly citizenUserEntityService: CitizenUserEntityService,
    private readonly jwtService: JwtService,
    private redisService: RedisService,
    private fileSGConfigService: FileSGConfigService,
    private agencyClientService: AgencyClientV2Service,
    private auditEventEntityService: AuditEventEntityService,
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

  public async ndiLogin(session: FileSGCitizenSession, { authCode, nonce }: LoginRequest) {
    const tokens = await this.singpassHelper.getTokens(authCode);
    this.logger.log(`[Singpass] Received Token`);

    const tokenPayload = await this.singpassHelper.getIdTokenPayload(tokens);
    this.logger.log(`[Singpass] Extracted payload from token`);

    if (tokenPayload.nonce !== nonce) {
      throw new SingpassNonceMatchError(COMPONENT_ERROR_CODE.AUTH_SERVICE);
    }

    const { nric, uuid } = this.singpassHelper.extractNricAndUuidFromPayload(tokenPayload);
    this.logger.log(`[Singpass] NRIC: ${maskUin(nric)}, uuid: ${uuid}`);

    const user = await this.getOrCreateCitizenUserUsingUin(nric);
    this.logger.log(`User successfully created/retrieved from db`);
    if (!user.isOnboarded) {
      await this.citizenUserEntityService.updateCitizenUserById(user.id, { name: null, email: null, phoneNumber: null });
      this.logger.log(`Resetting user name, email and phone number as he was not onboarded`);
    } else if (!user.name) {
      await this.updateUserNameFromMyInfo(user.id);
      this.logger.log(`Updated username from MyInfo in db`);
    }

    await this.updateCitizenUserSession(user, session);
    await this.citizenUserEntityService.updateCitizenUserById(user.id, { lastLoginAt: new Date() });
    await this.saveUserLoginAuditEvent({
      userId: user.id,
      authType: AUTH_TYPE.SINGPASS,
      sessionId: session.id,
      hasPerformedDocumentAction: false,
    });
  }

  async updateCitizenUserSession(user: CitizenUser, session: FileSGCitizenSession, ssoEservice?: SSO_ESERVICE) {
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
    };
    this.logger.log(`Session created for user ${user.id}|${user.uuid}|${user.name}`);
  }

  async getOrCreateCitizenUserUsingUin(nric: string): Promise<CitizenUser> {
    if (!isUinfinValid(nric)) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AUTH_SERVICE, 'Invalid UIN');
    }

    const user = await this.citizenUserEntityService.retrieveCitizenUserByUin(nric, { toThrow: false });

    if (user) {
      return user;
    }

    return await this.citizenUserEntityService.saveCitizenUser({ uin: nric, status: STATUS.ACTIVE });
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

  public async citizenLogout(id: number, session: FileSGCitizenSession) {
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

  public async icaSso(token: string, session: FileSGCitizenSession) {
    // NOTE: Will overwrite previous user session
    const uin = await this.agencyClientService.retrieveUinFromMyIca(token);
    this.logger.log(`SSO for ICA user with id: ${maskUin(uin)}`);
    const user = await this.getOrCreateCitizenUserUsingUin(uin);

    // Remove previous MyInfo details if user not onboarded
    if (!user.isOnboarded) {
      await this.citizenUserEntityService.updateCitizenUserById(user.id, { name: null, email: null, phoneNumber: null });
    }

    await this.updateCitizenUserSession(user, session, SSO_ESERVICE.MY_ICA);
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
