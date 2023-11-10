import { STATUS } from '@filesg/common';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { TimestampableEntity } from './base-model';
import { Transaction } from './transaction';
import { EserviceUser, User } from './user';

type OmitEmailAttributes = 'id';
type OptionalAttributes = 'transactions' | 'eserviceUser';
export type EserviceWhitelistedUserCreationModel = CreationAttributes<EserviceWhitelistedUser, OptionalAttributes, OmitEmailAttributes>;
export type EserviceWhitelistedUserUpdateModel = Partial<EserviceWhitelistedUserCreationModel>;

@Entity()
export class EserviceWhitelistedUser extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * This email is whitelisted for the eservice, enabling it to perform FormSG invocations.
   * The email is set as unique since it serves as an identifier to find the corresponding eservice,
   * and the agency is used during FormSG invocation to determine the user's affiliation.
   */
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'enum', enum: Object.values(STATUS) })
  status: STATUS;

  @OneToMany(() => Transaction, (transaction) => transaction.eserviceWhitelistedUser)
  transactions?: Transaction[];

  @ManyToOne(() => User, (eserviceUser: EserviceUser) => eserviceUser.whitelistedUsers, { nullable: false })
  eserviceUser?: EserviceUser;
}
