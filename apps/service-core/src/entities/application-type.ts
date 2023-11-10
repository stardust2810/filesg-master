import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { Application } from './application';
import { ApplicationTypeNotification } from './application-type-notification';
import { TimestampableEntity } from './base-model';
import { Eservice } from './eservice';

type OptionalAttributes = 'applications' | 'eservice' | 'applicationTypeNotifications';
type OmitAttributes = 'id' | 'uuid';
export type ApplicationTypeCreationModel = CreationAttributes<ApplicationType, OptionalAttributes, OmitAttributes>;

// When agency onboards, they will give us the name of the applicationType (e.g. Long Term Visit Pass),
// then FileSG will manual determine/derive the code from the name, decide whether to create new applicationType
// and link the relationship with the eservice
@Entity()
@Unique('composite', ['eservice', 'code'])
export class ApplicationType extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => Application, (application) => application.applicationType)
  applications?: Application[];

  @ManyToOne(() => Eservice, (eservice) => eservice.applicationTypes)
  eservice?: Eservice;

  //TODO: might need to add onDelete = CASCADE
  @OneToMany(() => ApplicationTypeNotification, (applicationTypeNotification) => applicationTypeNotification.applicationType, {
    cascade: true,
  })
  applicationTypeNotifications: ApplicationTypeNotification[];
}
