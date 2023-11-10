import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributesNoOptional } from '../typings/common';
import { TimestampableEntity } from './base-model';

type OmitAttributes = 'id';
export type EmailBlackListCreationModel = CreationAttributesNoOptional<EmailBlackList, OmitAttributes>;

@Entity()
export class EmailBlackList extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  emailAddress: string;
}
