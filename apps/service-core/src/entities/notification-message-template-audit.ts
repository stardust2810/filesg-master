import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { TimestampableEntity } from './base-model';
import { NotificationMessageTemplate } from './notification-message-template';

type OptionalAttributes = 'requiredFields' | 'externalTemplateId';
type OmitAttributes = 'id';
export type NotificationMessageTemplateAuditCreationModel = CreationAttributes<
  NotificationMessageTemplateAudit,
  OptionalAttributes,
  OmitAttributes
>;
export type NotificationMessageTemplateAuditUpdateModel = Partial<NotificationMessageTemplateAuditCreationModel>;

@Entity()
export class NotificationMessageTemplateAudit extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  template: string[];

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'simple-array', nullable: true })
  requiredFields: string[] | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  externalTemplateId: string | null;

  @ManyToOne(() => NotificationMessageTemplate, (notificationMessageTemplate) => notificationMessageTemplate.audits, { nullable: false })
  notificationMessageTemplate?: NotificationMessageTemplate;
}
