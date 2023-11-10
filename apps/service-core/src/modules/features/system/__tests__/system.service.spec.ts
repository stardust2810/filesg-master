import { ACTIVITY_STATUS, VIEWABLE_ACTIVITY_TYPES } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ActivityNotBannedException } from '../../../../common/filters/custom-exceptions.filter';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockEmailBlackListEntityService } from '../../../entities/email-black-list/__mocks__/email-black-list.entity.service.mock';
import { EmailBlackListEntityService } from '../../../entities/email-black-list/email-black-list.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockNotificationService } from '../../notification/__mocks__/notification.service.mock';
import { NotificationService } from '../../notification/notification.service';
import { mockReportDir } from '../__mocks__/reporting.service.mock';
import { activityWithoutBan, bannedFrom1FaActivity, bannedFrom2FaActivity, TestSystemService } from '../__mocks__/system.service.mock';

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockReportDir),
}));

describe('SystemService', () => {
  let service: TestSystemService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestSystemService,
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: EmailBlackListEntityService, useValue: mockEmailBlackListEntityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    service = module.get<TestSystemService>(TestSystemService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Public methods
  // ===========================================================================
  describe('lift1FaBan', () => {
    it('should be defined', () => {
      expect(service.lift1FaBan).toBeDefined();
    });

    it('1fa banned activity ', async () => {
      mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(bannedFrom1FaActivity);

      await service.lift1FaBan(bannedFrom1FaActivity.uuid);

      expect(mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes).toBeCalledWith(
        bannedFrom1FaActivity.uuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
      );
      expect(mockActivityEntityService.updateActivity).toBeCalledWith(bannedFrom1FaActivity.uuid, {
        recipientInfo: { ...bannedFrom1FaActivity.recipientInfo, failedAttempts: 0 },
        isBannedFromNonSingpassVerification: false,
      });
    });

    it('activity which is not banned will throw error', async () => {
      mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(activityWithoutBan);

      await expect(service.lift1FaBan(activityWithoutBan.uuid)).rejects.toThrowError(ActivityNotBannedException);

      expect(mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes).toBeCalledWith(
        activityWithoutBan.uuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
      );
    });

    it('2fa banned activity should throw error', async () => {
      mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(bannedFrom2FaActivity);

      await expect(service.lift1FaBan(bannedFrom2FaActivity.uuid)).rejects.toThrowError(ActivityNotBannedException);

      expect(mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes).toBeCalledWith(
        bannedFrom2FaActivity.uuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
      );
    });
  });

  describe('lift2FaBan', () => {
    it('should be defined', () => {
      expect(service.lift2FaBan).toBeDefined();
    });

    it('2fa banned activity ', async () => {
      mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(bannedFrom2FaActivity);

      await service.lift2FaBan(bannedFrom2FaActivity.uuid);

      expect(mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes).toBeCalledWith(
        bannedFrom2FaActivity.uuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
      );
      expect(mockActivityEntityService.updateActivity).toBeCalledWith(bannedFrom2FaActivity.uuid, {
        isBannedFromNonSingpassVerification: false,
      });
    });

    it('activity which is not banned will throw error', async () => {
      mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(activityWithoutBan);

      await expect(service.lift2FaBan(activityWithoutBan.uuid)).rejects.toThrowError(ActivityNotBannedException);

      expect(mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes).toBeCalledWith(
        activityWithoutBan.uuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
      );
    });

    it('1fa banned activity should throw error', async () => {
      mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes.mockResolvedValueOnce(bannedFrom1FaActivity);

      await expect(service.lift2FaBan(bannedFrom1FaActivity.uuid)).rejects.toThrowError(ActivityNotBannedException);

      expect(mockActivityEntityService.retrieveActivityByUuidAndStatusAndTypes).toBeCalledWith(
        bannedFrom1FaActivity.uuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
      );
    });
  });
});
