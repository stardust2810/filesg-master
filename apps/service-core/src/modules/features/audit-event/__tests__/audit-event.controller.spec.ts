import { AUDIT_EVENT_NAME, AUTH_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { NonSingpassContentRetrievalRequest } from '../../../../typings/common';
import { RequestWithSession } from '../../../../typings/common';
import { mockAuditEventService } from '../__mocks__/audit-event.service.mock';
import { AuditEventController } from '../audit-event.controller';
import { AuditEventService } from '../audit-event.service';

describe('AuditEventController', () => {
  let controller: AuditEventController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditEventController],
      providers: [
        {
          provide: AuditEventService,
          useValue: mockAuditEventService,
        },
      ],
    }).compile();

    controller = module.get<AuditEventController>(AuditEventController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userFilesNonSingpassAuditEvent', () => {
    it('should be defined', () => {
      expect(controller.userFilesNonSingpassAuditEvent).toBeDefined();
    });

    it('should save audit event with correct args', async () => {
      const mockFileAssetUuids = ['mockFileAssetUuid1'];
      const mockReq = { user: { userId: 1, sessionId: 'mockSessionId-1' } } as NonSingpassContentRetrievalRequest;

      await controller.userFilesNonSingpassAuditEvent(
        AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
        { fileAssetUuids: mockFileAssetUuids, hasPerformedDocumentAction: false },
        mockReq,
      );
      expect(mockAuditEventService.saveUserFilesAuditEvent).toBeCalledWith(AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD, mockFileAssetUuids, {
        authType: AUTH_TYPE.NON_SINGPASS,
        userId: mockReq.user.userId,
        sessionId: mockReq.user.sessionId,
        hasPerformedDocumentAction: false,
      });
    });
  });

  describe('userFilesSingpassAuditEvent', () => {
    it('should be defined', () => {
      expect(controller.userFilesSingpassAuditEvent).toBeDefined();
    });

    it('should save audit event with correct args', async () => {
      const mockFileAssetUuids = ['mockFileAssetUuid1'];
      const mockReq = { session: { id: 'mockSessionId-1', user: { userId: 1 } } } as RequestWithSession;

      await controller.userFilesSingpassAuditEvent(AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD, { fileAssetUuids: mockFileAssetUuids }, mockReq);
      expect(mockAuditEventService.saveUserFilesAuditEvent).toBeCalledWith(
        AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
        mockFileAssetUuids,
        {
          authType: AUTH_TYPE.SINGPASS,
          userId: mockReq.session.user.userId,
          sessionId: mockReq.session.id,
        },
        { id: 'mockSessionId-1', user: { userId: 1 } },
      );
    });
  });
});
