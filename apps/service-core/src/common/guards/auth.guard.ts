import { EntityNotFoundException, UnauthorizedRequestException, UserRoleErrorException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, FEATURE_TOGGLE, ROLE, USER_TYPE } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { addMinutes } from 'date-fns';

import { ProgrammaticAuthRequest } from '../../dtos/auth/request';
import { User } from '../../entities/user';
import { ProgrammaticUserEntityService } from '../../modules/entities/user/programmatic-user.entity.service';
import { UserEntityService } from '../../modules/entities/user/user.entity.service';
import { AuthService } from '../../modules/features/auth/auth.service';
import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { APPLICATION_REDIS_PREFIX, FileSGWidgetSession, RequestHeaderWithClient, RequestWithSession } from '../../typings/common';
import { hash } from '../../utils/encryption';
import { AUTH_KEY, AUTH_STATE, AuthInterface } from '../decorators/filesg-auth.decorator';
import { AuthDecoratorMissingException, DuplicateSessionException, InvalidSessionException } from '../filters/custom-exceptions.filter';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private redisService: RedisService,
    private userEntityService: UserEntityService,
    private programmaticUserEntityService: ProgrammaticUserEntityService,
    private fileSGConfigService: FileSGConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextHandler = context.getHandler();
    const contextClass = context.getClass();
    const auth = this.reflector.getAllAndOverride<AuthInterface>(AUTH_KEY, [contextHandler, contextClass]);

    const contextHttp = context.switchToHttp();
    const req = contextHttp.getRequest();
    const { originalUrl } = req;

    let userUuid = '';
    this.logger.verbose(`[AuthGuard] checking request auth state, url: ${originalUrl} - ${AUTH_KEY} -${JSON.stringify(auth)}`);

    if (!auth || !auth.auth_state) {
      throw new AuthDecoratorMissingException(COMPONENT_ERROR_CODE.AUTH_GUARD, contextHandler.name, contextClass.name);
    }

    switch (auth.auth_state) {
      case AUTH_STATE.NO_LOGGED_IN:
        await this.checkForDuplicateSession(req);
        return true;
      case AUTH_STATE.CITIZEN_LOGGED_IN:
        userUuid = await this.checkCitizenUserSession(req, auth.requireOnboardedUser);
        break;
      case AUTH_STATE.AGENCY_LOGGED_IN:
        userUuid = await this.checkAgencyUserSession(req);
        break;
      case AUTH_STATE.PROGRAMMATIC_LOGGED_IN:
        userUuid = await this.checkProgrammaticUser(req);
        break;
      case AUTH_STATE.JWT:
        return true;
      default:
        return false;
    }

    await this.checkUserRole(userUuid, auth.roles);
    return true;
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================

  private async checkCitizenUserSession(req: RequestWithSession, requireOnboardedUser = true) {
    if (!req || !req.session || !req.session.cookie || !req.session.user) {
      const internalLog = `Citizen user request doesnt contain any session information`;
      throw new InvalidSessionException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
    }

    await this.checkForDuplicateSession(req);

    // only enables this validation when not doing perf test which requires user onboarding reset
    if (
      this.fileSGConfigService.systemConfig.toggleOnboardingReset === FEATURE_TOGGLE.OFF &&
      requireOnboardedUser &&
      !req.session.user.isOnboarded &&
      req.session.user.type === USER_TYPE.CITIZEN // gd TODO: temporarily putting this condition here until we add session validation handler for corporateUser
    ) {
      const internalLog = `Non-Onboarded users are not allowed to invoke path ${req.path}`;
      throw new InvalidSessionException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
    }

    return req.session.user.userUuid;
  }

  private async checkAgencyUserSession(req: RequestWithSession) {
    const { applicationId, sessionKey } = req.body;
    const widgetSessionData = await this.redisService.get(
      FILESG_REDIS_CLIENT.WIDGET_SESSION,
      `${APPLICATION_REDIS_PREFIX}${applicationId}`,
    );
    if (!applicationId || !sessionKey || !widgetSessionData) {
      const internalLog = `Agency user request doesnt contain any session information`;
      throw new InvalidSessionException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
    }

    // by using applicationId to fetch sessionId from redis,
    // we ensure that both the applicationId and sessionId given are valid
    const sessionObj: FileSGWidgetSession = JSON.parse(widgetSessionData);
    if (hash('sha256', sessionObj.sessionId) !== sessionKey) {
      const internalLog = `Session id provided is not valid.`;
      throw new InvalidSessionException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
    }
    return req.session.user.userUuid;
  }

  private async checkProgrammaticUser(req: RequestHeaderWithClient) {
    const clientId = req.headers['x-client-id'];
    const secret = req.headers['x-client-secret'];
    if (!req || !clientId || !secret) {
      const internalLog = `Missing clientId or Secret`;
      throw new UnauthorizedRequestException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
    }

    const authReq: ProgrammaticAuthRequest = { clientId, secret };
    const programmaticUser = await this.programmaticUserEntityService.retrieveProgrammaticUserByClientId(clientId, { toThrow: false });

    if (!programmaticUser || !(await this.authService.validateProgrammaticUser(authReq, programmaticUser))) {
      const internalLog = `Programmatic user request is unauthorized: ${clientId}.`;
      throw new UnauthorizedRequestException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
    }

    const { sessionLengthInSecs, extendSessionWarningDurationInSecs, absoluteSessionExpiryInMins } = this.fileSGConfigService.sessionConfig;

    const expiresAt = addMinutes(new Date(), absoluteSessionExpiryInMins);

    req.session.user = {
      userId: programmaticUser.id,
      userUuid: programmaticUser.uuid,
      name: programmaticUser.name,
      maskedUin: null,
      type: USER_TYPE.PROGRAMMATIC,
      role: programmaticUser.role,
      isOnboarded: programmaticUser.isOnboarded,
      lastLoginAt: null,
      createdAt: new Date(),
      expiresAt,
      sessionLengthInSecs,
      extendSessionWarningDurationInSecs,
      ssoEservice: null,
      hasPerformedDocumentAction: false,
      corporateUen: null,
      corporateName: null,
      accessibleAgencies: null,
    };
    return programmaticUser.uuid;
  }

  private async checkUserRole(userUuid: string, roles?: ROLE[]) {
    if (!roles || roles.length === 0) {
      return;
    }

    const user = await this.userEntityService.retrieveUserByUuid(userUuid);

    if (!user) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.AUTH_GUARD, User.name, 'uuid', userUuid);
    }
    const hasSufficientPermission = roles.includes(user.role);

    if (!hasSufficientPermission) {
      const internalLog = 'User does not have enough role to access this endpoint';
      throw new UserRoleErrorException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
    }
  }

  private async checkForDuplicateSession(req: RequestWithSession) {
    if (!req.session.user) {
      return;
    }
    // Removes existing session for user. Disabled on DEV env
    const { toggleConcurrentSession } = this.fileSGConfigService.sessionConfig;
    if (toggleConcurrentSession === FEATURE_TOGGLE.OFF) {
      const currentSession = await this.redisService.get(FILESG_REDIS_CLIENT.USER, req.session.user.userUuid);
      if (currentSession && req.sessionID !== currentSession) {
        await this.redisService.del(FILESG_REDIS_CLIENT.EXPRESS_SESSION, `sess:${req.sessionID}`);
        const internalLog = `Duplicate session exists for user, deleting older session.`;
        throw new DuplicateSessionException(COMPONENT_ERROR_CODE.AUTH_GUARD, internalLog);
      }
    }
  }
}
