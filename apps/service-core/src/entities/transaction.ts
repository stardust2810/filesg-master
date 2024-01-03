/**
 * There will be one new transaction whenever Agency called FileSG API or Agency is the recipient of MoP action.
 * It is a collection of activities to complete the 'task' required for operations involving Agency.
 */
import { TRANSACTION_CREATION_METHOD, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@filesg/common';
import { CustomAgencyMessage } from '@filesg/common';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { Activity } from './activity';
import { Application } from './application';
import { TimestampableEntity } from './base-model';
import { EserviceWhitelistedUser } from './eservice-whitelisted-user';
import { NotificationMessageInput } from './notification-message-input';
import { User } from './user';

type OptionalAttributes =
  | 'fileSessionId'
  | 'customAgencyMessage'
  | 'customMessage'
  | 'activities'
  | 'userId'
  | 'applicationId'
  | 'application'
  | 'user'
  | 'parent'
  | 'children'
  | 'parentId'
  | 'eserviceWhitelistedUser'
  | 'notificationMessageInputs';
type OmitAttributes = 'id' | 'uuid';
export type TransactionCreationModel = CreationAttributes<Transaction, OptionalAttributes, OmitAttributes>;
export type TransactionUpdateModel = Partial<TransactionCreationModel>;

@Entity()
export class Transaction extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'enum', enum: Object.values(TRANSACTION_TYPE) })
  type: TRANSACTION_TYPE;

  @Column({ type: 'enum', enum: Object.values(TRANSACTION_CREATION_METHOD) })
  creationMethod: TRANSACTION_CREATION_METHOD;

  @Column({ type: 'enum', enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.INIT })
  status: TRANSACTION_STATUS;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  fileSessionId: string | null;

  @Column({ type: 'json', nullable: true })
  customAgencyMessage: CustomAgencyMessage | null;

  @Column({ type: 'json', nullable: true })
  customMessage: string[] | null;

  @OneToMany(() => Activity, (applicationActivity) => applicationActivity.transaction, { cascade: true })
  activities?: Activity[];

  @ManyToOne(() => Application, (application) => application.transactions, { nullable: false })
  application?: Application;

  @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
  user?: User;

  @ManyToOne(() => EserviceWhitelistedUser, (whitelistedUser) => whitelistedUser.transactions, { nullable: true })
  eserviceWhitelistedUser?: EserviceWhitelistedUser;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  applicationId: number;

  @OneToMany(() => NotificationMessageInput, (notificationMessageInput) => notificationMessageInput.transaction, { nullable: true })
  notificationMessageInputs?: NotificationMessageInput[];

  @ManyToOne(() => Transaction, (transaction) => transaction.children, { nullable: true })
  parent?: Transaction | null;

  @Column({ nullable: true })
  parentId: number | null;

  @OneToMany(() => Transaction, (transaction) => transaction.parent, { nullable: true })
  children?: Transaction[];
}
