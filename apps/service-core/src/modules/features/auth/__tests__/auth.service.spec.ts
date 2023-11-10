import { InputValidationException, maskUin } from '@filesg/backend-common';
import {
  AUDIT_EVENT_NAME,
  AUTH_TYPE,
  COMPONENT_ERROR_CODE,
  FEATURE_TOGGLE,
  MyInfoUserDetailsResponse,
  SSO_ESERVICE,
  STATUS,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';

import {
  MyInfoException,
  SingpassNonceMatchError,
  UserAlreadyOnboardedException,
} from '../../../../common/filters/custom-exceptions.filter';
import { AgencyUser, CitizenUser, User } from '../../../../entities/user';
import { DB_QUERY_ERROR, MYINFO_PROVIDER, SINGPASS_PROVIDER } from '../../../../typings/common';
import * as helpers from '../../../../utils/helpers';
import { mockAgencyEntityService } from '../../../entities/agency/__mocks__/agency.entity.service.mock';
import { AgencyEntityService } from '../../../entities/agency/agency.entity.service';
import { mockAuditEventEntityService } from '../../../entities/audit-event/__mocks__/audit-event.entity.service.mock';
import { AuditEventEntityService } from '../../../entities/audit-event/audit-event.entity.service';
import { mockCitizenUserEntityService } from '../../../entities/user/__mocks__/citizen-user.entity.service.mock';
import { mockCorporateEntityService } from '../../../entities/user/__mocks__/corporate/corporate.entity.service.mock';
import { mockCorporateUserEntityService } from '../../../entities/user/__mocks__/corporate-user/corporate-user.entity.service.mock';
import { mockProgrammaticUserEntityService } from '../../../entities/user/__mocks__/programmatic-user.entity.service.mock';
import { mockUserEntityService } from '../../../entities/user/__mocks__/user.entity.service.mock';
import { CitizenUserEntityService } from '../../../entities/user/citizen-user.entity.service';
import { CorporateEntityService } from '../../../entities/user/corporate/corporate.entity.service';
import { CorporateUserEntityService } from '../../../entities/user/corporate-user/corporate-user.entity.service';
import { ProgrammaticUserEntityService } from '../../../entities/user/programmatic-user.entity.service';
import { UserEntityService } from '../../../entities/user/user.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockAgencyClientV2Service } from '../../agency-client/__mocks__/agency-client.v2.service.mock';
import { AgencyClientV2Service } from '../../agency-client/agency-client.v2.service';
import {
  IdTokenPayload,
  mockAuthUser,
  mockLoginReq,
  mockMyIcaToken,
  mockSession,
  mockSessionWithNamelessUser,
  mockSessionWithNonOnboardedUser,
  mockTokenPayload,
  mockTokens,
  mockUser,
} from '../__mocks__/auth.service.mock';
import { mockJwtService } from '../__mocks__/jwt.service.mock';
import { mockMyInfoHelper, mockSingpassHelper } from '../__mocks__/singpass-myinfo-helper.mock';
import { AuthService } from '../auth.service';

describe('Authentication Service', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: CorporateEntityService, useValue: mockCorporateEntityService },
        { provide: CorporateUserEntityService, useValue: mockCorporateUserEntityService },
        { provide: ProgrammaticUserEntityService, useValue: mockProgrammaticUserEntityService },
        { provide: CitizenUserEntityService, useValue: mockCitizenUserEntityService },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(AgencyUser), useValue: {} },
        { provide: getRepositoryToken(CitizenUser), useValue: {} },
        { provide: SINGPASS_PROVIDER, useValue: mockSingpassHelper },
        { provide: MYINFO_PROVIDER, useValue: mockMyInfoHelper },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: AgencyClientV2Service, useValue: mockAgencyClientV2Service },
        { provide: AuditEventEntityService, useValue: mockAuditEventEntityService },
        { provide: AgencyEntityService, useValue: mockAgencyEntityService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // eslint-disable-next-line sonarjs/no-duplicate-string
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('ndiLogin', () => {
    it('should be defined', () => {
      expect(authService.ndiLogin).toBeDefined();
    });

    it('should throw exception when nonce mismatches', async () => {
      // mock data
      const mockUnmatchingTokenPayload = { nonce: mockLoginReq.nonce + 'not equal' } as IdTokenPayload;
      // mock return
      mockSingpassHelper.getTokens.mockResolvedValue(mockTokens);
      mockSingpassHelper.getIdTokenPayload.mockResolvedValue(mockUnmatchingTokenPayload);

      await expect(authService.ndiLogin(mockSession, mockLoginReq)).rejects.toThrow(
        new SingpassNonceMatchError(COMPONENT_ERROR_CODE.AUTH_SERVICE),
      );
      expect(mockSingpassHelper.getTokens).toBeCalledWith(mockLoginReq.authCode);
      expect(mockSingpassHelper.getIdTokenPayload).toBeCalledWith(mockTokens);
    });

    it('should return session when user successfully login', async () => {
      // mock data

      // mock return
      mockSingpassHelper.getTokens.mockResolvedValue(mockTokens);
      mockSingpassHelper.getIdTokenPayload.mockResolvedValue(mockTokenPayload);
      mockSingpassHelper.extractNricAndUuidFromPayload.mockReturnValue({ nric: mockUser.uin });
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUser);
      mockCitizenUserEntityService.updateCitizenUserById.mockResolvedValueOnce(mockUser);

      const response = await authService.ndiLogin(mockSession, mockLoginReq);
      expect(mockSingpassHelper.getTokens).toBeCalledWith(mockLoginReq.authCode);
      expect(mockSingpassHelper.getIdTokenPayload).toBeCalledWith(mockTokens);
      expect(mockUserEntityService.retrieveUserByUin).toBeCalledWith(mockUser.uin, { toThrow: false });
      expect(mockFileSGRedisService.set).toBeCalledWith(FILESG_REDIS_CLIENT.USER, mockUser.uuid, mockSession.id);
      expect(response).toBeUndefined;
    });

    it('should return delete concurrent session concurrent setting is on', async () => {
      // mock data

      mockFileSGConfigService.sessionConfig.toggleConcurrentSession = FEATURE_TOGGLE.OFF;

      // mock return
      mockSingpassHelper.getTokens.mockResolvedValue(mockTokens);
      mockSingpassHelper.getIdTokenPayload.mockResolvedValue(mockTokenPayload);
      mockSingpassHelper.extractNricAndUuidFromPayload.mockReturnValue({ nric: mockUser.uin });
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUser);
      mockCitizenUserEntityService.updateCitizenUserById.mockResolvedValueOnce(mockUser);
      mockFileSGRedisService.get.mockResolvedValueOnce(mockSession);

      const response = await authService.ndiLogin(mockSession, mockLoginReq);
      expect(mockSingpassHelper.getTokens).toBeCalledWith(mockLoginReq.authCode);
      expect(mockSingpassHelper.getIdTokenPayload).toBeCalledWith(mockTokens);
      expect(mockUserEntityService.retrieveUserByUin).toBeCalledWith(mockUser.uin, { toThrow: false });
      expect(mockFileSGRedisService.set).toBeCalledWith(FILESG_REDIS_CLIENT.USER, mockUser.uuid, mockSession.id);
      expect(response).toBeUndefined;
    });

    it('should update name of onboarded user if not previously available', async () => {
      // mock data
      const mockNamelessUser = { ...mockUser, name: null };
      // mock return
      mockSingpassHelper.getTokens.mockResolvedValue(mockTokens);
      mockSingpassHelper.getIdTokenPayload.mockResolvedValue(mockTokenPayload);
      mockSingpassHelper.extractNricAndUuidFromPayload.mockReturnValue({ nric: mockNamelessUser.uin });
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockNamelessUser);
      jest.spyOn(authService, 'getUserDetailsFromMyInfo').mockResolvedValue({ name: 'testName' } as MyInfoUserDetailsResponse);
      mockCitizenUserEntityService.updateCitizenUserById.mockResolvedValueOnce({ ...mockNamelessUser, name: 'testName' });

      const response = await authService.ndiLogin(mockSessionWithNamelessUser, mockLoginReq);
      expect(mockSingpassHelper.getTokens).toBeCalledWith(mockLoginReq.authCode);
      expect(mockSingpassHelper.getIdTokenPayload).toBeCalledWith(mockTokens);
      expect(mockUserEntityService.retrieveUserByUin).toBeCalledWith(mockNamelessUser.uin, { toThrow: false });
      expect(mockCitizenUserEntityService.updateCitizenUserById).toBeCalledWith(mockNamelessUser.id, { name: 'testName' });
      expect(mockFileSGRedisService.set).toBeCalledWith(FILESG_REDIS_CLIENT.USER, mockNamelessUser.uuid, mockSessionWithNamelessUser.id);
      expect(response).toBeUndefined;
    });

    it('should return remove user details before proceeding if user is not onboarded', async () => {
      // mock data
      const mockUnonboardedUser = { ...mockUser, isOnboarded: false };
      // mock return
      mockSingpassHelper.getTokens.mockResolvedValue(mockTokens);
      mockSingpassHelper.getIdTokenPayload.mockResolvedValue(mockTokenPayload);
      mockSingpassHelper.extractNricAndUuidFromPayload.mockReturnValue({ nric: mockUser.uin });
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUnonboardedUser);
      mockCitizenUserEntityService.updateCitizenUserById.mockResolvedValue(mockUnonboardedUser);

      const response = await authService.ndiLogin(mockSessionWithNonOnboardedUser, mockLoginReq);
      expect(mockSingpassHelper.getTokens).toBeCalledWith(mockLoginReq.authCode);
      expect(mockSingpassHelper.getIdTokenPayload).toBeCalledWith(mockTokens);
      expect(mockUserEntityService.retrieveUserByUin).toBeCalledWith(mockUnonboardedUser.uin, { toThrow: false });
      expect(mockCitizenUserEntityService.updateCitizenUserById).toHaveBeenNthCalledWith(1, mockUnonboardedUser.id, {
        name: null,
        email: null,
        phoneNumber: null,
      });
      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.USER,
        mockUnonboardedUser.uuid,
        mockSessionWithNonOnboardedUser.id,
      );
      expect(response).toBeUndefined;
    });

    it(`should save user login audit event when login successfully`, async () => {
      mockSingpassHelper.getIdTokenPayload.mockResolvedValue(mockTokenPayload);
      mockSingpassHelper.extractNricAndUuidFromPayload.mockReturnValue({ nric: mockUser.uin });
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUser);

      await authService.ndiLogin(mockSession, mockLoginReq);

      expect(mockAuditEventEntityService.insertAuditEvents).toBeCalledWith([
        {
          eventName: AUDIT_EVENT_NAME.USER_LOGIN,
          subEventName: mockSession.id,
          data: {
            userId: mockUser.id,
            authType: AUTH_TYPE.SINGPASS,
            sessionId: mockSession.id,
            hasPerformedDocumentAction: false,
          },
        },
      ]);
    });
  });

  describe('citizenLogout', () => {
    it('should be defined', () => {
      expect(authService.citizenLogout).toBeDefined();
    });

    it('should logout onboarded user', async () => {
      // mock data

      // mock return
      const response = await authService.citizenLogout(mockUser.id, mockSession);
      expect(mockCitizenUserEntityService.updateCitizenUserById).toBeCalledTimes(0);
      expect(mockSession.destroy).toBeCalled();
      expect(mockFileSGRedisService.del).toBeCalledWith(FILESG_REDIS_CLIENT.USER, mockUser.id.toString());
      expect(response).toBeUndefined;
    });

    it('should delete non-onboarded user details', async () => {
      // mock data

      // mock return
      const response = await authService.citizenLogout(mockUser.id, mockSessionWithNonOnboardedUser);
      expect(mockCitizenUserEntityService.updateCitizenUserById).toBeCalledWith(mockUser.id, {
        name: null,
        email: null,
        phoneNumber: null,
      });
      expect(mockSessionWithNonOnboardedUser.destroy).toBeCalled();
      expect(mockFileSGRedisService.del).toBeCalledWith(FILESG_REDIS_CLIENT.USER, mockUser.id.toString());
      expect(response).toBeUndefined;
    });
  });

  describe('singpassLoginParams', () => {
    it('should be defined', () => {
      expect(authService.getLoginContext).toBeDefined();
    });

    it('should return response with location in header', async () => {
      // mock data
      const { redirectUrl, authUrl, clientId } = mockFileSGConfigService.singpassConfig;
      jest.spyOn(helpers, 'generateUuid').mockReturnValue('test');

      // mock return
      const response = await authService.getLoginContext();
      expect(response.url).toContain(
        `${authUrl}?scope=openid&response_type=code&redirect_uri=${redirectUrl}&state=test&nonce=test&client_id=${clientId}`,
      );
    });
  });

  describe('icaSso', () => {
    it('should be defined', () => {
      expect(authService.icaSso).toBeDefined();
    });

    it('should call MyICA Do Login API with token, create session with onboarded user', async () => {
      // mock data
      const mockUin = mockUser.uin;

      // mock return
      mockAgencyClientV2Service.retrieveUinFromMyIca.mockResolvedValueOnce(mockUin);
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUser);
      // mockCitizenUserEntityService.buildCitizenUser.mockResolvedValue(mockUser);
      // mockCitizenUserEntityService.saveCitizenUser.mockResolvedValue(mockUser);

      expect(await authService.icaSso(mockMyIcaToken, mockSession));
      expect(mockAgencyClientV2Service.retrieveUinFromMyIca).toBeCalledWith(mockMyIcaToken);
      expect(mockFileSGRedisService.set).toBeCalledWith(FILESG_REDIS_CLIENT.USER, mockUser.uuid, mockSession.id);
    });

    it('should delete previous data is user is not onboarded', async () => {
      // mock data
      const mockUin = mockUser.uin;

      // mock return
      mockAgencyClientV2Service.retrieveUinFromMyIca.mockResolvedValue(mockUin);
      mockUserEntityService.retrieveUserByUin.mockResolvedValue({ ...mockUser, isOnboarded: false });
      mockCitizenUserEntityService.buildCitizenUser.mockResolvedValue(mockUser);
      mockCitizenUserEntityService.saveCitizenUser.mockResolvedValue(mockUser);

      expect(await authService.icaSso(mockMyIcaToken, mockSession));
      expect(mockAgencyClientV2Service.retrieveUinFromMyIca).toBeCalledWith(mockMyIcaToken);
      expect(mockCitizenUserEntityService.updateCitizenUserById).toBeCalledWith(mockUser.id, {
        name: null,
        email: null,
        phoneNumber: null,
      });
      expect(mockFileSGRedisService.set).toBeCalledWith(FILESG_REDIS_CLIENT.USER, mockUser.uuid, mockSession.id);
    });

    it(`should save user login audit event when login successfully`, async () => {
      mockAgencyClientV2Service.retrieveUinFromMyIca.mockResolvedValueOnce(mockUser.uin);
      mockUserEntityService.retrieveUserByUin.mockResolvedValueOnce(mockUser);

      await authService.icaSso(mockMyIcaToken, mockSession);

      expect(mockAuditEventEntityService.insertAuditEvents).toBeCalledWith([
        {
          eventName: AUDIT_EVENT_NAME.USER_LOGIN,
          subEventName: mockSession.id,
          data: {
            userId: mockUser.id,
            authType: AUTH_TYPE.SINGPASS_SSO,
            sessionId: mockSession.id,
            ssoEservice: SSO_ESERVICE.MY_ICA,
            hasPerformedDocumentAction: false,
          },
        },
      ]);
    });
  });

  describe('updateUserFromMcc', () => {
    it('should be defined', () => {
      expect(authService.updateUserFromMcc).toBeDefined();
    });
    it('should throw error is user is onboarded', async () => {
      await expect(authService.updateUserFromMcc({ ...mockAuthUser, isOnboarded: true })).rejects.toThrowError(
        UserAlreadyOnboardedException,
      );
    });
    it('should call MCC API and update citizen user', async () => {
      // mock data
      const mockUserId = mockUser.id;
      const mockMccResponse = {
        personalInfo: { personName: 'testName', personSurname: 'testSurname' },
        contactInfo: { contactEmailAddr: 'testEmail', contactMobileNo: 'testMobile' },
      };

      // mock return
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValue(mockUser);
      mockAgencyClientV2Service.retrieveUserInfoFromMcc.mockResolvedValue(mockMccResponse);

      expect(await authService.updateUserFromMcc({ ...mockAuthUser, isOnboarded: false }));
      expect(await mockAgencyClientV2Service.retrieveUserInfoFromMcc).toBeCalledWith(mockUser.uin);
      expect(await mockCitizenUserEntityService.updateCitizenUserById).toHaveBeenNthCalledWith(1, mockUserId, {
        name: 'testSurname testName',
        phoneNumber: 'testMobile',
      });
      expect(mockCitizenUserEntityService.updateCitizenUserById).toHaveBeenNthCalledWith(2, mockUserId, {
        email: 'testEmail',
      });
    });
  });

  describe('myInfo', () => {
    it('should be defined', () => {
      expect(authService.updateUserNameFromMyInfo).toBeDefined();
    });
    it('should throw error is user is onboarded', async () => {
      await expect(authService.updateUserDetailsFromMyInfo({ ...mockAuthUser, isOnboarded: true })).rejects.toThrowError(
        UserAlreadyOnboardedException,
      );
    });

    it('should throw exception if myinfo has error', async () => {
      // mock return
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValue(mockUser);
      mockMyInfoHelper.getPersonBasic.mockRejectedValue('anything');

      await expect(authService.updateUserDetailsFromMyInfo({ ...mockAuthUser, isOnboarded: false })).rejects.toThrow(
        new MyInfoException(COMPONENT_ERROR_CODE.AUTH_SERVICE, maskUin(mockUser.uin!), 'error'),
      );
    });

    it('should update user with info from myinfo', async () => {
      // mock data
      const mockMyInfoResponse = {
        mobileno: { prefix: { value: '+' }, areacode: { value: '65' }, nbr: { value: '87654321' } },
        email: { value: mockUser.email },
        name: { value: mockUser.name },
      };

      // mock return
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValue(mockUser);
      mockMyInfoHelper.getPersonBasic.mockResolvedValue(mockMyInfoResponse);

      await authService.updateUserDetailsFromMyInfo({ ...mockAuthUser, isOnboarded: false });
      expect(mockMyInfoHelper.getPersonBasic).toBeCalledWith(mockUser.uin, mockFileSGConfigService.myinfoConfig.attributes);
      expect(mockCitizenUserEntityService.retrieveCitizenUserById).toBeCalledWith(mockAuthUser.userId);
      expect(mockCitizenUserEntityService.updateCitizenUserById).toHaveBeenNthCalledWith(1, mockAuthUser.userId, {
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
      });
      expect(mockCitizenUserEntityService.updateCitizenUserById).toHaveBeenNthCalledWith(2, mockAuthUser.userId, {
        email: mockUser.email,
      });
    });

    it('should return duplicated email if db duplicate exception is thrown', async () => {
      // mock data
      const mockMyInfoResponse = {
        mobileno: { prefix: { value: '+' }, areacode: { value: '65' }, nbr: { value: '87654321' } },
        email: { value: mockUser.email },
        name: { value: mockUser.name },
      };

      // mock return
      mockCitizenUserEntityService.retrieveCitizenUserById.mockResolvedValue(mockUser);
      mockMyInfoHelper.getPersonBasic.mockResolvedValue(mockMyInfoResponse);
      mockCitizenUserEntityService.updateCitizenUserById.mockResolvedValueOnce({});
      mockCitizenUserEntityService.updateCitizenUserById.mockImplementation(() => {
        throw new QueryFailedError('update', undefined, { code: DB_QUERY_ERROR.DuplicateEntryError });
      });

      const response = await authService.updateUserDetailsFromMyInfo({ ...mockAuthUser, isOnboarded: false });
      expect(await mockMyInfoHelper.getPersonBasic).toBeCalledWith(mockUser.uin, mockFileSGConfigService.myinfoConfig.attributes);
      expect(await mockCitizenUserEntityService.retrieveCitizenUserById).toBeCalledWith(mockAuthUser.userId);
      expect(await mockCitizenUserEntityService.updateCitizenUserById).toHaveBeenNthCalledWith(1, mockAuthUser.userId, {
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
      });
      expect(await mockCitizenUserEntityService.updateCitizenUserById).toHaveBeenNthCalledWith(2, mockAuthUser.userId, {
        email: mockUser.email,
      });

      expect(response).toStrictEqual({ duplicateEmail: mockUser.email });
    });
  });

  describe('helper functions', () => {
    it('getOrCreateUserUsingUin should throw exception when uinfin is not valid', async () => {
      // mock data
      const mockUserWithInvalidFin = { ...mockUser, uin: 'S3002610T' };
      mockUserEntityService.retrieveUserByUin.mockResolvedValue(null);

      await expect(authService.getOrCreateUserUsingUin(mockUserWithInvalidFin.uin)).rejects.toThrow(
        new InputValidationException(COMPONENT_ERROR_CODE.AUTH_SERVICE, 'Invalid UIN'),
      );
    });

    it('getOrCreateUserUsingUin should save user if citizen with valid uin does not exist in system', async () => {
      // mock data
      mockUserEntityService.retrieveUserByUin.mockResolvedValue(null);

      await authService.getOrCreateUserUsingUin(mockUser.uin!);
      expect(mockCitizenUserEntityService.saveCitizenUser).toBeCalledWith({ uin: mockUser.uin, status: STATUS.ACTIVE });
    });
  });
});
