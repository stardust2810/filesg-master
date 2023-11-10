import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { AcknowledgementTemplateContent, CreationAttributes } from '../typings/common';
import { Activity } from './activity';
import { TimestampableEntity } from './base-model';
import { Eservice } from './eservice';

type OptionalAttributes = 'eservice' | 'activities' | 'eserviceId';
type OmitAttributes = 'id' | 'uuid';
export type AcknowledgementTemplateCreationModel = CreationAttributes<AcknowledgementTemplate, OptionalAttributes, OmitAttributes>;

@Entity()
@Unique('composite', ['eservice', 'name'])
export class AcknowledgementTemplate extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'json', nullable: false })
  content: AcknowledgementTemplateContent;

  @OneToMany(() => Activity, (activity) => activity.acknowledgementTemplate)
  activities?: Activity[];

  @ManyToOne(() => Eservice, (eservice) => eservice.acknowledgementTemplates, { nullable: false })
  eservice?: Eservice;

  @Column({ nullable: false })
  eserviceId: number;
}
