import { AUDIT_EVENT_NAME } from '@filesg/common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AuditEventData, CreationAttributes } from '../typings/common';
import { TimestampableEntity } from './base-model';

type OptionalAuditEventAttributes = 'subEventName';
type OmitAuditEventAttributes = 'id';
export type AuditEventCreationModel = CreationAttributes<AuditEvent, OptionalAuditEventAttributes, OmitAuditEventAttributes>;

// TODO: store in nosql / move to dynamoDB?
@Entity()
//FIXME: using table inheritance on eventName column causes inserted value to become 'AuditEvent'
// @TableInheritance({ column: { type: 'enum', enum: Object.values(AUDIT_EVENT_NAME), name: 'eventName' } })
export class AuditEvent extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  eventName: AUDIT_EVENT_NAME;

  @Column({ type: 'varchar', nullable: true })
  subEventName: string | null;

  @Column({ type: 'json' })
  data: AuditEventData;
}

// @ChildEntity(AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD)
// export class UserDownloadFileAuditEvent extends AuditEvent {
//   eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD;
//   data: UserDownloadFileAuditEventData;
// }

// @ChildEntity(AUDIT_EVENT_NAME.USER_FILE_PRINT_SAVE)
// export class UserPrintSaveFileAuditEvent extends AuditEvent {
//   eventName: AUDIT_EVENT_NAME.USER_FILE_PRINT_SAVE;
//   data: UserPrintSaveFileAuditEventData;
// }

// @ChildEntity(AUDIT_EVENT_NAME.USER_FILE_VIEW)
// export class UserViewFileAuditEvent extends AuditEvent {
//   eventName: AUDIT_EVENT_NAME.USER_FILE_VIEW;
//   data: UserViewFileAuditEventData;
// }
