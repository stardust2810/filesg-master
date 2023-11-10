import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { ApplicationType } from './application-type';
import { TimestampableEntity } from './base-model';
import { Eservice } from './eservice';
import { Transaction } from './transaction';

type OptionalAttributes = 'transactions' | 'externalRefId' | 'eservice' | 'applicationType';
type OmitAttributes = 'id' | 'uuid';
export type ApplicationCreationModel = CreationAttributes<Application, OptionalAttributes, OmitAttributes>;

@Unique('externalRefId_eservice_applicationType', ['externalRefId', 'eservice', 'applicationType'])
@Entity()
export class Application extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar', nullable: true })
  externalRefId: string | null;

  @OneToMany(() => Transaction, (transaction) => transaction.application)
  transactions?: Transaction[];

  // This index is to replace the removed composite index
  @Index('FK_598c9847c5af2155aeff71091c')
  @ManyToOne(() => Eservice, (eservice) => eservice.applications, { nullable: false })
  eservice?: Eservice;

  @ManyToOne(() => ApplicationType, (applicationType) => applicationType.applications, { nullable: false })
  applicationType?: ApplicationType;
}
