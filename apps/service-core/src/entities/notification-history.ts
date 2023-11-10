import { NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '@filesg/common';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { Activity } from './activity';
import { TimestampableEntity } from './base-model';

type OptionalAttributes = 'statusDetails' | 'messageId';
type OmitAttributes = 'id' | 'uuid';

export type NotificationHistoryCreationModel = CreationAttributes<NotificationHistory, OptionalAttributes, OmitAttributes>;
export type NotificationHistoryyUpdateModel = Partial<NotificationHistoryCreationModel>;

@Entity()
export class NotificationHistory extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'enum', enum: Object.values(NOTIFICATION_CHANNEL) })
  notificationChannel: NOTIFICATION_CHANNEL;

  @Column({ type: 'enum', enum: Object.values(NOTIFICATION_STATUS) })
  status: NOTIFICATION_STATUS;

  @Column({ type: 'text', nullable: true })
  statusDetails: string | null;

  @ManyToOne(() => Activity, (activity) => activity.notificationHistories, { nullable: false })
  activity?: Activity;

  @Column({ type: 'varchar', nullable: true })
  messageId: string | null;
}
