import { Replace } from '@filesg/common';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { TimestampableEntity } from './base-model';
import { CorporateUser } from './corporate-user';
import { CorporateBaseUser, CorporateBaseUserCreationModel } from './user';

type OptionalCorporateWithBaseUserAttributes = 'name' | 'corporateUsers';
type OptionalCorporateAttributes = OptionalCorporateWithBaseUserAttributes | 'user';
type OmitCorporateAttributes = 'id';

export type CorporateCreationModel = CreationAttributes<Corporate, OptionalCorporateAttributes, OmitCorporateAttributes>;

export type CorporateWithBaseUserCreationModel = CreationAttributes<
  Replace<Corporate, 'user', CorporateBaseUserCreationModel>,
  OptionalCorporateWithBaseUserAttributes,
  OmitCorporateAttributes
>;

@Entity()
export class Corporate extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', unique: true })
  uen: string;

  @OneToOne(() => CorporateBaseUser, (user) => user.corporate, { cascade: ['insert'] })
  @JoinColumn()
  user?: CorporateBaseUser;

  @OneToMany(() => CorporateUser, (corporateUser) => corporateUser.corporate)
  corporateUsers?: CorporateUser[];
}
