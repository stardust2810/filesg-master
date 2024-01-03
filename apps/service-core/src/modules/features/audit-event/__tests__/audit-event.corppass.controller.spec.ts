import { AUDIT_EVENT_NAME, AUTH_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RequestWithCorporateUserSession } from '../../../../typings/common';
import { mockAuditEventService } from '../__mocks__/audit-event.service.mock';
import { CorppassAuditEventController } from '../audit-event.corppass.controller';
import { AuditEventService } from '../audit-event.service';

describe('CorppassAuditEventController', () => {
  let controller: CorppassAuditEventController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorppassAuditEventController],
      providers: [
        {
          provide: AuditEventService,
          useValue: mockAuditEventService,
        },
      ],
    }).compile();

    controller = module.get<CorppassAuditEventController>(CorppassAuditEventController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userFilesCorppassAuditEvent', () => {
    it('should be defined', () => {
      expect(controller.userFilesCorppassAuditEvent).toBeDefined();
    });

    it('should save audit event with correct args', async () => {
      const mockFileAssetUuids = ['mockFileAssetUuid1'];
      const mockReq = { session: { id: 'mockSessionId-1', user: { userId: 1 } } } as RequestWithCorporateUserSession;

      await controller.userFilesCorppassAuditEvent(
        { eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD },
        { fileAssetUuids: mockFileAssetUuids },
        mockReq,
      );
      expect(mockAuditEventService.saveUserFilesAuditEvent).toBeCalledWith(
        AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
        mockFileAssetUuids,
        {
          authType: AUTH_TYPE.CORPPASS,
          userId: mockReq.session.user.userId,
          sessionId: mockReq.session.id,
          corporateId: mockReq.session.user.corporateBaseUserId,
        },
        { id: 'mockSessionId-1', user: { userId: 1 } },
      );
    });
  });
});
