import { INTEGRATION_TYPE, NOTIFICATION_TEMPLATE_TYPE } from '@filesg/common';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { Agency } from './agency';
import { TimestampableEntity } from './base-model';

type OptionalAttributes = 'requiredFields' | 'agency' | 'integrationType';
type OmitAttributes = 'id' | 'uuid';

export type TransactionCustomMessageTemplateCreationModel = CreationAttributes<
  TransactionCustomMessageTemplate,
  OptionalAttributes,
  OmitAttributes
>;
export type TransactionCustomMessageTemplateyUpdateModel = Partial<TransactionCustomMessageTemplateCreationModel>;

@Entity()
@Unique('composite', ['agency', 'name'])
export class TransactionCustomMessageTemplate extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'json' })
  template: string[];

  @Column({ type: 'simple-array', nullable: true })
  requiredFields: string[] | null;

  @Column({ type: 'enum', enum: Object.values(NOTIFICATION_TEMPLATE_TYPE) })
  type: NOTIFICATION_TEMPLATE_TYPE;

  @Column({ type: 'enum', enum: Object.values(INTEGRATION_TYPE), nullable: true })
  integrationType: INTEGRATION_TYPE | null;

  @ManyToOne(() => Agency, (agency) => agency.transactionCustomMessageTemplates, { nullable: false })
  agency?: Agency;
}
