import { AuditEvent, AuditEventCreationModel } from '../../../../entities/audit-event';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockAuditEvent = (args: TestCreationModel<AuditEventCreationModel>) => {
  const auditEvent = new AuditEvent();

  args.id && (auditEvent.id = args.id);
  auditEvent.eventName = args.eventName;
  args.subEventName && (auditEvent.subEventName = args.subEventName);
  auditEvent.data = args.data;

  return auditEvent;
};
