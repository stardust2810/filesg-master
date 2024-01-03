import { IcaSsoRequest } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { transformUserSessionDetailsResponse } from '../../../../common/transformers/auth.transformer';
import { LoginRequest } from '../../../../dtos/auth/request';
import { FileSGCitizenSession, RequestWithCitizenSession } from '../../../../typings/common';
import { mockAuthService, mockCitizenAuthUser, mockUser } from '../__mocks__/auth.service.mock';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // eslint-disable-next-line sonarjs/no-duplicate-string
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('citizen login', () => {
    it('should be defined', () => {
      expect(controller.citizenLogin).toBeDefined();
    });

    it('should call ndiLogin method with session and login request', async () => {
      const mockReqBody: LoginRequest = { authCode: 'testAuthCode', nonce: 'testNonce' };
      const mockSession = {} as FileSGCitizenSession;

      expect(await controller.citizenLogin(mockSession, mockReqBody));
      expect(mockAuthService.ndiLogin).toBeCalledWith(mockSession, mockReqBody);
    });
  });

  describe('citizen logout', () => {
    it('should be defined', () => {
      expect(controller.logout).toBeDefined();
    });

    it('should call ndiLogin method with session and login request', async () => {
      const mockSession = { user: mockCitizenAuthUser } as FileSGCitizenSession;
      const mockReqBody = { session: mockSession } as RequestWithCitizenSession;
      const mockRes = {
        clearCookie: jest.fn(),
      };
      mockRes.clearCookie.mockResolvedValue({});
      expect(await controller.logout(mockReqBody, mockRes as unknown as Response, mockSession));
      expect(mockAuthService.citizenLogout).toBeCalledWith(mockUser.id, mockSession);
    });
  });

  describe('getLoginContext', () => {
    it('should be defined', () => {
      expect(controller.getLoginContext).toBeDefined();
    });

    it('should call singpassLoginParams', async () => {
      expect(await controller.getLoginContext());
      expect(mockAuthService.getLoginContext).toBeCalledWith();
    });
  });

  describe('getUserDetails', () => {
    it('should be defined', () => {
      expect(controller.getUserDetails).toBeDefined();
    });

    it('should return session user', async () => {
      const mockSession = { user: mockCitizenAuthUser } as FileSGCitizenSession;

      const response = await controller.getUserDetails(mockSession);
      expect(response).toStrictEqual(transformUserSessionDetailsResponse(mockCitizenAuthUser));
    });

    it('should return null if no user', async () => {
      const mockSession = { user: undefined } as unknown as FileSGCitizenSession;

      const response = await controller.getUserDetails(mockSession);
      expect(response).toBeNull();
    });
  });

  describe('icaSso', () => {
    it('should be defined', () => {
      expect(controller.icaSso).toBeDefined();
    });

    it('should call icaSso method with token and session', async () => {
      const mockReqBody: IcaSsoRequest = { token: 'testToken' };
      const mockSession = {} as FileSGCitizenSession;

      expect(await controller.icaSso(mockSession, mockReqBody));
      expect(mockAuthService.icaSso).toBeCalledWith(mockReqBody.token, mockSession);
    });
  });

  describe('myInfo', () => {
    it('should be defined', () => {
      expect(controller.updateUserDetailsUsingMyInfo).toBeDefined();
    });

    it('should call updateUserDetailsFromMyInfo method session', async () => {
      const mockSession = {
        user: {},
      } as FileSGCitizenSession;

      expect(await controller.updateUserDetailsUsingMyInfo(mockSession));
      expect(mockAuthService.updateUserDetailsFromMyInfo).toBeCalledWith(mockSession.user);
    });
  });

  describe('mcc', () => {
    it('should be defined', () => {
      expect(controller.updateUserFromMcc).toBeDefined();
    });

    it('should call updateUserDetailsFromMyInfo method session', async () => {
      const mockSession = {
        user: {},
      } as FileSGCitizenSession;

      expect(await controller.updateUserFromMcc(mockSession));
      expect(mockAuthService.updateUserFromMcc).toBeCalledWith(mockSession.user);
    });
  });
});
