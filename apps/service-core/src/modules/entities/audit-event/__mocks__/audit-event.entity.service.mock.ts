import { MockService } from '../../../../typings/common.mock';
import { AuditEventEntityService } from '../audit-event.entity.service';

export const mockAuditEventEntityService: MockService<AuditEventEntityService> = {
  buildAuditEventModel: jest.fn(),
  saveAuditEvent: jest.fn(),
  insertAuditEvents: jest.fn(),
  retrieveAuditEvents: jest.fn(),
  retrieveAgencyAndApplicationTypeEventCountsByEventNames: jest.fn(),
  retrieveUserActionsAuditEvents: jest.fn(),
  updateAuditEventBySubEventName: jest.fn(),
};
