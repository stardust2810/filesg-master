import { Replace } from '@filesg/common';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { getDbColumnEncryptionTransformer } from '../utils/encryption';
import { TimestampableEntity } from './base-model';
import { Corporate } from './corporate';
import { CorporateUserBaseUser, CorporateUserBaseUserCreationModel } from './user';

type OptionalCorporateUserWithBaseUserAttributes = 'name' | 'lastLoginAt' | 'corporateId';
type OptionalCorporateUserAttributes = OptionalCorporateUserWithBaseUserAttributes | 'user';
type OmitCorporateUserAttributes = 'id';

export type CorporateUserCreationModel = CreationAttributes<CorporateUser, OptionalCorporateUserAttributes, OmitCorporateUserAttributes>;

export type CorporateUserWithBaseUserCreationModel = CreationAttributes<
  Replace<CorporateUser, 'user', CorporateUserBaseUserCreationModel>,
  OptionalCorporateUserWithBaseUserAttributes,
  OmitCorporateUserAttributes
>;

export type CorporateUserUpdateModel = Partial<CorporateUserCreationModel>;

@Entity()
@Unique('composite', ['uin', 'corporate'])
export class CorporateUser extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', transformer: getDbColumnEncryptionTransformer() })
  uin: string;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @OneToOne(() => CorporateUserBaseUser, (user) => user.corporateUser, { cascade: ['insert'] })
  @JoinColumn()
  user?: CorporateUserBaseUser;

  @ManyToOne(() => Corporate, (corporate) => corporate.corporateUsers, { nullable: false })
  corporate?: Corporate;

  @Column({ nullable: false })
  corporateId: number;
}
