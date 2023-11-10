import { INTEGRATION_TYPE, NOTIFICATION_CHANNEL, NOTIFICATION_TEMPLATE_TYPE } from '@filesg/common';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { Agency } from './agency';
import { TimestampableEntity } from './base-model';
import { NotificationMessageInput } from './notification-message-input';
import { NotificationMessageTemplateAudit } from './notification-message-template-audit';

type OptionalAttributes = 'requiredFields' | 'audits' | 'notificationMessageInputs' | 'externalTemplateId' | 'agency' | 'integrationType';
type OmitAttributes = 'id' | 'uuid';
export type NotificationMessageTemplateCreationModel = CreationAttributes<NotificationMessageTemplate, OptionalAttributes, OmitAttributes>;
export type NotificationMessageTemplateUpdateModel = Partial<NotificationMessageTemplateCreationModel>;

@Entity()
@Unique('composite', ['agency', 'name'])
export class NotificationMessageTemplate extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'json' })
  template: string[];

  // ENHANCEMENT: Typeorm has a version control decorator
  // https://orkhan.gitbook.io/typeorm/docs/entities#special-columns
  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'simple-array', nullable: true })
  requiredFields: string[] | null;

  @Column({ type: 'enum', enum: Object.values(NOTIFICATION_TEMPLATE_TYPE) })
  type: NOTIFICATION_TEMPLATE_TYPE;

  @Column({ type: 'enum', enum: Object.values(NOTIFICATION_CHANNEL) })
  notificationChannel: NOTIFICATION_CHANNEL;

  @Column({ type: 'enum', enum: Object.values(INTEGRATION_TYPE), nullable: true })
  integrationType: INTEGRATION_TYPE | null;

  @Column({ type: 'varchar', nullable: true })
  externalTemplateId: string | null;

  @OneToMany(
    () => NotificationMessageTemplateAudit,
    (notificationMessageTemplateAudit) => notificationMessageTemplateAudit.notificationMessageTemplate,
  )
  audits?: NotificationMessageTemplateAudit[];

  @OneToMany(() => NotificationMessageInput, (notificationMessageInput) => notificationMessageInput.notificationMessageTemplate)
  notificationMessageInputs?: NotificationMessageInput[];

  @ManyToOne(() => Agency, (agency) => agency.notificationMessageTemplates, { nullable: false })
  agency?: Agency;
}
