import { STATUS } from '@filesg/common';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { oaSigningKeyEncryptionTransformer } from '../utils/encryption';
import { TimestampableEntity } from './base-model';
import { Eservice } from './eservice';
import { NotificationMessageTemplate } from './notification-message-template';
import { TransactionCustomMessageTemplate } from './transaction-custom-message-template';

type OptionalAttributes =
  | 'eservices'
  | 'oaSigningKey'
  | 'identityProofLocation'
  | 'transactionCustomMessageTemplates'
  | 'notificationMessageTemplates';
type OmitAttributes = 'id' | 'uuid' | 'status';
export type AgencyCreationModel = CreationAttributes<Agency, OptionalAttributes, OmitAttributes>;

@Entity()
export class Agency extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: Object.values(STATUS) })
  status: STATUS;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', nullable: true, transformer: oaSigningKeyEncryptionTransformer })
  oaSigningKey: string;

  @Column({ type: 'varchar', nullable: true })
  identityProofLocation: string;

  @OneToMany(() => Eservice, (eservice) => eservice.agency, { cascade: true })
  eservices?: Eservice[];

  @OneToMany(() => TransactionCustomMessageTemplate, (transactionCustomMessageTemplate) => transactionCustomMessageTemplate.agency)
  transactionCustomMessageTemplates?: TransactionCustomMessageTemplate[];

  @OneToMany(() => NotificationMessageTemplate, (notificationMessageTemplate) => notificationMessageTemplate.agency)
  notificationMessageTemplates?: NotificationMessageTemplate[];
}
