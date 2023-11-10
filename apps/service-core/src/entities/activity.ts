/**
 * It is the modular 'task' required for operations involving Agency.
 * Only a subset of Activity will be shown on the All Activities page.
 */

import { ACTIVITY_STATUS, ACTIVITY_TYPE } from '@filesg/common';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ActivityRecipientInfo, CreationAttributes } from '../typings/common';
import { AcknowledgementTemplate } from './acknowledgement-template';
import { TimestampableEntity } from './base-model';
import { Email } from './email';
import { FileAsset } from './file-asset';
import { NotificationHistory } from './notification-history';
import { Transaction } from './transaction';
import { User } from './user';

/**
 * Many-to-One:
 * - if table not joined, undefined will be returned.
 * - if property has no value, null will be returned.
 * - if configured to be nullable, the column needs to be typed with (someType | null)
 *
 * One-to-Many & Many-to-Many:
 * - if table not joined, undefined will be returned.
 * - if property has no value, empty array will be returned.
 */

type OptionalAttributes =
  | 'isBannedFromNonSingpassVerification'
  | 'recipientInfo'
  | 'children'
  | 'emails'
  | 'notificationHistories'
  | 'parent'
  | 'transaction'
  | 'user'
  | 'fileAssets'
  | 'parentId'
  | 'transactionId'
  | 'userId'
  | 'isAcknowledgementRequired'
  | 'isNonSingpassRetrievable'
  | 'acknowledgedAt'
  | 'acknowledgementTemplate'
  | 'acknowledgementTemplateId';
type OmitAttributes = 'id' | 'uuid';
export type ActivityCreationModel = CreationAttributes<Activity, OptionalAttributes, OmitAttributes>;
export type ActivityUpdateModel = Partial<ActivityCreationModel>;

@Entity()
export class Activity extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'enum', enum: Object.values(ACTIVITY_STATUS) })
  status: ACTIVITY_STATUS;

  @Column({ type: 'enum', enum: Object.values(ACTIVITY_TYPE) })
  type: ACTIVITY_TYPE;

  @Column({ type: 'json', nullable: true })
  recipientInfo: ActivityRecipientInfo | null;

  @Column({ type: 'bool', default: false })
  isBannedFromNonSingpassVerification: boolean;

  @Column({ type: 'bool', default: false })
  isNonSingpassRetrievable: boolean;

  @OneToMany(() => Activity, (activity) => activity.parent, { nullable: true })
  children?: Activity[];

  @OneToMany(() => Email, (email) => email.activity, { cascade: true })
  emails?: Email[];

  @OneToMany(() => NotificationHistory, (notificationHistory) => notificationHistory.activity, { cascade: true })
  notificationHistories?: NotificationHistory[];

  @ManyToOne(() => Activity, (activity) => activity.children, { nullable: true })
  parent?: Activity | null;

  @ManyToOne(() => Transaction, (transaction) => transaction.activities, { nullable: false })
  transaction?: Transaction;

  @ManyToOne(() => User, (user) => user.activities, { nullable: false })
  user?: User;

  @ManyToMany(() => FileAsset, (fileAsset) => fileAsset.activities)
  @JoinTable({ name: 'activity_file' })
  fileAssets?: FileAsset[];

  @Column({ nullable: true })
  parentId: number | null;

  @Column({ nullable: false })
  transactionId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ type: 'bool', default: false })
  isAcknowledgementRequired: boolean;

  @Column({ type: 'datetime', nullable: true })
  acknowledgedAt: Date | null;

  @ManyToOne(() => AcknowledgementTemplate, (acknowledgementTemplate) => acknowledgementTemplate.activities, { nullable: true })
  acknowledgementTemplate?: AcknowledgementTemplate;

  @Column({ nullable: true })
  acknowledgementTemplateId: number | null;
}
