/* eslint-disable sonarjs/no-duplicate-string */
import { Test, TestingModule } from '@nestjs/testing';

import { mockAgencyOnboardingService } from '../__mocks__/agency-onboarding.service.mock';
import { mockReportingService } from '../__mocks__/reporting.service.mock';
import { mockSystemService } from '../__mocks__/system.service.mock';
import { AgencyOnboardingService } from '../agency-onboarding.service';
import { ReportingService } from '../reporting.service';
import { SystemController } from '../system.controller';
import { SystemService } from '../system.service';

describe('System Controller', () => {
  let controller: SystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        { provide: AgencyOnboardingService, useValue: mockAgencyOnboardingService },
        { provide: ReportingService, useValue: mockReportingService },
        { provide: SystemService, useValue: mockSystemService },
      ],
    }).compile();

    controller = module.get<SystemController>(SystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('onboardNewAgency', () => {
    it('should be defined', () => {
      expect(controller.onboardNewAgency).toBeDefined();
    });
  });

  describe('onboardNewEservice', () => {
    it('should be defined', () => {
      expect(controller.onboardNewEservices).toBeDefined();
    });
  });

  describe('onboardNewEserviceAcknowledgementTemplate', () => {
    it('should be defined', () => {
      expect(controller.onboardNewEserviceAcknowledgementTemplate).toBeDefined();
    });
  });

  describe('onboardNewTransactionCustomMessageTemplate', () => {
    it('should be defined', () => {
      expect(controller.onboardNewTransactionCustomMessageTemplate).toBeDefined();
    });
  });

  describe('updateTransactionCustomMessageTemplate', () => {
    it('should be defined', () => {
      expect(controller.updateTransactionCustomMessageTemplate).toBeDefined();
    });
  });

  describe('updateNotificationMessageTemplate', () => {
    it('should be defined', () => {
      expect(controller.updateNotificationMessageTemplate).toBeDefined();
    });
  });

  describe('onboardNewAgencyUsers', () => {
    it('should be defined', () => {
      expect(controller.onboardNewAgencyUsers).toBeDefined();
    });
  });

  describe('onboardNewEserviceWhitelistedUsers', () => {
    it('should be defined', () => {
      expect(controller.onboardNewEserviceWhitelistedUsers).toBeDefined();
    });
  });

  describe('inactivateNewEserviceWhitelistedUsers', () => {
    it('should be defined', () => {
      expect(controller.inactivateNewEserviceWhitelistedUsers).toBeDefined();
    });
  });

  describe('resendNotification', () => {
    it('should be defined', () => {
      expect(controller.resendNotification).toBeDefined();
    });
  });
  describe('issuanceQuery', () => {
    it('should be defined', () => {
      expect(controller.issuanceQuery).toBeDefined();
    });
  });

  describe('generateAcgencyTransactionsReport', () => {
    it('should be defined', () => {
      expect(controller.generateAgencyTransactionsReport).toBeDefined();
    });
  });
  describe('generateFileSgStatisticsReport', () => {
    it('should be defined', () => {
      expect(controller.generateFileSgStatisticsReport).toBeDefined();
    });
  });
  describe('generateFileSgUserActionsReport', () => {
    it('should be defined', () => {
      expect(controller.generateFileSgUserActionsReport).toBeDefined();
    });
  });
});
