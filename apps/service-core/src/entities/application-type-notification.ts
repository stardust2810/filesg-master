import { NOTIFICATION_CHANNEL } from '@filesg/common';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributesNoOptional } from '../typings/common';
import { ApplicationType } from './application-type';
import { TimestampableEntity } from './base-model';

type OmitAttributes = 'id';
export type ApplicationTypeNotificationCreationModel = CreationAttributesNoOptional<ApplicationTypeNotification, OmitAttributes>;

@Entity()
export class ApplicationTypeNotification extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Object.values(NOTIFICATION_CHANNEL) })
  notificationChannel: NOTIFICATION_CHANNEL;

  @ManyToOne(() => ApplicationType, (applicationType) => applicationType.applicationTypeNotifications, { nullable: false })
  applicationType?: ApplicationType;
}
