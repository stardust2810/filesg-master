import { AUDIT_EVENT_NAME, AUTH_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserFilesAuditEventData, UserNonSsoSessionAuditEventData, UserSsoSessionAuditEventData } from '../../../../typings/common';
import { mockAuditEventEntityService } from '../../../entities/audit-event/__mocks__/audit-event.entity.service.mock';
import { AuditEventEntityService } from '../../../entities/audit-event/audit-event.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockDatabaseTransaction, mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import {
  mockCitizenUser,
  mockEservice,
  mockFileAsset,
  mockSessionId,
  mockUserSessionAuditEventData,
} from '../__mocks__/audit-event.service.mock';
import { AuditEventService } from '../audit-event.service';

describe('AuditEventService', () => {
  let service: AuditEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditEventService,
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: AuditEventEntityService, useValue: mockAuditEventEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
      ],
    }).compile();

    service = module.get<AuditEventService>(AuditEventService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveUserFilesAuditEvent', () => {
    it('should be defined', () => {
      expect(service.saveUserFilesAuditEvent).toBeDefined();
    });

    it('should call methods with correct args', async () => {
      mockFileAssetEntityService.retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId.mockResolvedValueOnce([mockFileAsset]);
      const { entityManager } = mockDatabaseTransaction;

      await service.saveUserFilesAuditEvent(AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD, [mockFileAsset.uuid], mockUserSessionAuditEventData);

      const { userId, sessionId, ssoEservice, authType } = mockUserSessionAuditEventData;
      const mockBaseUserSessionAuditEventData = {
        sessionId,
        userId,
        authType,
        ssoEservice,
      } as UserSsoSessionAuditEventData | UserNonSsoSessionAuditEventData;

      const mockDownloadFileAuditEvent: UserFilesAuditEventData = {
        ...mockBaseUserSessionAuditEventData,
        eservice: mockEservice.name,
        fileAssetUuid: mockFileAsset.uuid,
        fileName: mockFileAsset.name,
        applicationType: mockFileAsset.activities![0].transaction!.application?.applicationType!.name,
        agency: mockFileAsset.issuer?.eservices![0].agency!.name,
      };

      expect(mockAuditEventEntityService.insertAuditEvents).toBeCalledWith(
        [
          {
            eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
            subEventName: mockFileAsset.issuer?.eservices![0].agency?.code,
            data: mockDownloadFileAuditEvent,
          },
        ],
        entityManager,
      );
    });

    it('should return without creating record if no fileAsset found', async () => {
      await service.saveUserFilesAuditEvent(AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD, [mockFileAsset.uuid], {
        sessionId: mockSessionId,
        authType: AUTH_TYPE.SINGPASS,
        userId: mockCitizenUser.id,
        hasPerformedDocumentAction: false,
      });

      expect(mockAuditEventEntityService.insertAuditEvents).not.toBeCalled();
    });
  });
});
