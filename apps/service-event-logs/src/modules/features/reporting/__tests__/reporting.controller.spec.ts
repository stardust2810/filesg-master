import { Test, TestingModule } from '@nestjs/testing';

import { mockReportingService } from '../__mocks__/reporting.service.mock';
import { ReportingController } from '../reporting.controller';
import { ReportingService } from '../reporting.service';

describe('ReportingController', () => {
  let controller: ReportingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportingController],
      providers: [{ provide: ReportingService, useValue: mockReportingService }],
    }).compile();

    controller = module.get<ReportingController>(ReportingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateFormSgIssuanceReport', () => {
    it('should be defined', async () => {
      expect(controller.generateFormSgIssuanceReport).toBeDefined();
    });
  });
});
