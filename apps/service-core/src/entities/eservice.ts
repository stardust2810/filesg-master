import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { AcknowledgementTemplate } from './acknowledgement-template';
import { Agency } from './agency';
import { Application } from './application';
import { ApplicationType } from './application-type';
import { TimestampableEntity } from './base-model';
import { User } from './user';

type OptionalAttributes = 'agency' | 'agencyId' | 'applications' | 'users' | 'applicationTypes' | 'acknowledgementTemplates';
type OmitAttributes = 'id' | 'uuid';
export type EserviceCreationModel = CreationAttributes<Eservice, OptionalAttributes, OmitAttributes>;

@Entity()
@Unique('composite', ['agency', 'name'])
export class Eservice extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column('simple-array')
  emails: string[];

  @ManyToOne(() => Agency, (agency) => agency.eservices, { nullable: false })
  agency?: Agency;

  @Column({ nullable: false })
  agencyId: number;

  @OneToMany(() => Application, (application) => application.eservice, { cascade: true })
  applications?: Application[];

  @OneToMany(() => AcknowledgementTemplate, (acknowledgementTemplate) => acknowledgementTemplate.eservice, { cascade: true })
  acknowledgementTemplates?: AcknowledgementTemplate[];

  @ManyToMany(() => User, (user) => user.eservices, { cascade: true })
  @JoinTable({ name: 'eservice_user' })
  users?: User[];

  @OneToMany(() => ApplicationType, (applicationType) => applicationType.eservice, { cascade: true })
  applicationTypes?: ApplicationType[];
}
