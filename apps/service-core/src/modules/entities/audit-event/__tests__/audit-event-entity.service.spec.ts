import { Test, TestingModule } from '@nestjs/testing';

import { mockAuditEventEntityRepository } from '../__mocks__/audit-event.entity.repository.mock';
import { AuditEventEntityRepository } from '../audit-event.entity.repository';
import { AuditEventEntityService } from '../audit-event.entity.service';

describe('AuditEventEntityService', () => {
  let service: AuditEventEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditEventEntityService,
        {
          provide: AuditEventEntityRepository,
          useValue: mockAuditEventEntityRepository,
        },
      ],
    }).compile();

    service = module.get<AuditEventEntityService>(AuditEventEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildAuditEventModel', () => {
    it('should be defined', () => {
      expect(service.buildAuditEventModel).toBeDefined();
    });

    it('should call repo method with correct args', () => {
      expect(service.buildAuditEventModel).toBeDefined();
    });
  });
});
