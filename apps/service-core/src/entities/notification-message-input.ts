import { NOTIFICATION_CHANNEL, TemplateMessageInput } from '@filesg/common';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributesNoOptional } from '../typings/common';
import { TimestampableEntity } from './base-model';
import { NotificationMessageTemplate } from './notification-message-template';
import { Transaction } from './transaction';

type OmitAttributes = 'id' | 'uuid';

export type NotificationMessageInputCreationModel = CreationAttributesNoOptional<NotificationMessageInput, OmitAttributes>;
export type NotificationMessageInputyUpdateModel = Partial<NotificationMessageInputCreationModel>;

@Entity()
export class NotificationMessageInput extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'enum', enum: Object.values(NOTIFICATION_CHANNEL) })
  notificationChannel: NOTIFICATION_CHANNEL;

  @ManyToOne(() => NotificationMessageTemplate, (notificationMessageTemplate) => notificationMessageTemplate.notificationMessageInputs, {
    nullable: false,
  })
  notificationMessageTemplate?: NotificationMessageTemplate;

  @Column({ type: 'json', nullable: true })
  templateInput: TemplateMessageInput | null;

  @Column({ type: 'int' })
  templateVersion: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.notificationMessageInputs, { nullable: false })
  transaction?: Transaction;
}
