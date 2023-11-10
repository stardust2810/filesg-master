import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { EMAIL_TYPES } from '../utils/email-template';
import { Activity } from './activity';
import { TimestampableEntity } from './base-model';

type OptionalEmailAttributes = 'eventType' | 'subEventType' | 'activity';
type OmitEmailAttributes = 'id';
export type EmailCreationModel = CreationAttributes<Email, OptionalEmailAttributes, OmitEmailAttributes>;

@Entity()
export class Email extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  awsMessageId: string;

  @Column({ type: 'enum', enum: Object.values(EMAIL_TYPES), nullable: false })
  type: EMAIL_TYPES;

  @Column({ type: 'varchar' })
  emailId: string;

  @Column({ type: 'varchar', nullable: true })
  eventType: string | null;

  @Column({ type: 'varchar', nullable: true })
  subEventType: string | null;

  @ManyToOne(() => Activity, (activity) => activity.emails, { nullable: false })
  activity?: Activity;
}
