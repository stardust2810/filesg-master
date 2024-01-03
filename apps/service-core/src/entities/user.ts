import { ROLE, STATUS, USER_TYPE } from '@filesg/common';
import { ChildEntity, Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { getDbColumnEncryptionTransformer } from '../utils/encryption';
import { Activity } from './activity';
import { TimestampableEntity } from './base-model';
import { Corporate } from './corporate';
import { CorporateUser } from './corporate-user';
import { Eservice } from './eservice';
import { EserviceWhitelistedUser } from './eservice-whitelisted-user';
import { FileAsset } from './file-asset';
import { Transaction } from './transaction';

type OptionalUserAttributes =
  | 'uin'
  | 'name'
  | 'email'
  | 'phoneNumber'
  | 'isOnboarded'
  | 'role'
  | 'lastLoginAt'
  | 'ownedfileAssets'
  | 'issuedFileAssets'
  | 'activities'
  | 'transactions'
  | 'eservices';

type OmitUserAttributes = 'id' | 'uuid' | 'type';

type OptionalAgencyUserAttributes = OptionalUserAttributes;
type OptionalCitizenUserAttributes = Exclude<OptionalUserAttributes, 'uin'> | 'contactUpdateBannedUntil';
type OptionalProgrammaticUserAttributes = OptionalUserAttributes;
type OptionalEserviceUserAttributes = OptionalUserAttributes | 'whitelistedUsers';
type OptionalCorporateUserAttributes = OptionalUserAttributes | 'corporate';
type OptionalCorporateUserUserAttributes = OptionalUserAttributes | 'corporateUser';

export type AgencyUserCreationModel = CreationAttributes<AgencyUser, OptionalAgencyUserAttributes, OmitUserAttributes>;
export type CitizenUserCreationModel = CreationAttributes<CitizenUser, OptionalCitizenUserAttributes, OmitUserAttributes>;
export type ProgrammaticUserCreationModel = CreationAttributes<ProgrammaticUser, OptionalProgrammaticUserAttributes, OmitUserAttributes>;
export type EserviceUserCreationModel = CreationAttributes<EserviceUser, OptionalEserviceUserAttributes, OmitUserAttributes>;
export type CorporateBaseUserCreationModel = CreationAttributes<
  CorporateBaseUser,
  OptionalCorporateUserAttributes,
  OmitUserAttributes | 'role'
>;
export type CorporateUserBaseUserCreationModel = CreationAttributes<
  CorporateUserBaseUser,
  OptionalCorporateUserUserAttributes,
  OmitUserAttributes | 'role'
>;

export type AgencyUserUpdateModel = Partial<AgencyUserCreationModel>;
export type CitizenUserUpdateModel = Partial<CitizenUserCreationModel>;
export type ProgrammaticUserUpdateModel = Partial<ProgrammaticUserCreationModel>;
export type EserviceUserUpdateModel = Partial<EserviceUserCreationModel>;
export type CorporateBaseUserUpdateModel = Partial<CorporateBaseUserCreationModel>;
export type CorporateUserBaseUserUpdateModel = Partial<CorporateUserBaseUserCreationModel>;

// If column is nullable or having a default value, the column should be added to the OptionalAttribute interface
@Entity()
@TableInheritance({ column: { type: 'enum', enum: Object.values(USER_TYPE), name: 'type' } })
export class User extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
    transformer: getDbColumnEncryptionTransformer(),
  })
  uin: string | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'enum', enum: Object.values(USER_TYPE) })
  type: USER_TYPE;

  @Column({ type: 'bool', default: false })
  isOnboarded: boolean;

  @Column({ type: 'enum', enum: Object.values(STATUS) })
  status: STATUS;

  // Role has default because it is a hierarchy enum
  @Column({ type: 'enum', enum: Object.values(ROLE), default: ROLE.CITIZEN })
  role: ROLE;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => FileAsset, (fileAsset) => fileAsset.owner)
  ownedfileAssets?: FileAsset[];

  @OneToMany(() => FileAsset, (fileAsset) => fileAsset.issuer)
  issuedFileAssets?: FileAsset[];

  @OneToMany(() => Activity, (activity) => activity.user)
  activities?: Activity[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions?: Transaction[];

  @ManyToMany(() => Eservice, (eservice) => eservice.users)
  eservices?: Eservice[];
}

@ChildEntity(USER_TYPE.AGENCY)
export class AgencyUser extends User {
  type: USER_TYPE.AGENCY;
}

@ChildEntity(USER_TYPE.CITIZEN)
export class CitizenUser extends User {
  uin: string;
  type: USER_TYPE.CITIZEN;
  role: ROLE.CITIZEN;
  eservices: never;

  @Column({ type: 'datetime', nullable: true })
  contactUpdateBannedUntil: Date | null;
}

@ChildEntity(USER_TYPE.PROGRAMMATIC)
export class ProgrammaticUser extends User {
  uin: null;
  type: USER_TYPE.PROGRAMMATIC;
  role: ROLE.PROGRAMMATIC_READ | ROLE.PROGRAMMATIC_WRITE | ROLE.SYSTEM | ROLE.PROGRAMMATIC_SYSTEM_INTEGRATION;

  @Column({ type: 'varchar', unique: true })
  clientId: string;

  @Column({ type: 'varchar' })
  clientSecret: string;
}

@ChildEntity(USER_TYPE.ESERVICE)
export class EserviceUser extends User {
  uin: null;
  type: USER_TYPE.ESERVICE;
  role: ROLE.FORMSG;

  @OneToMany(() => EserviceWhitelistedUser, (eserviceUserGroup) => eserviceUserGroup.eserviceUser, { cascade: true })
  whitelistedUsers?: EserviceWhitelistedUser[];
}

@ChildEntity(USER_TYPE.CORPORATE)
export class CorporateBaseUser extends User {
  type: USER_TYPE.CORPORATE;
  role: ROLE.CORPORATE;

  @OneToOne(() => Corporate, (corporate) => corporate.user)
  corporate?: Corporate;
}

@ChildEntity(USER_TYPE.CORPORATE_USER)
export class CorporateUserBaseUser extends User {
  type: USER_TYPE.CORPORATE_USER;
  role: ROLE.CORPORATE_USER;

  @OneToOne(() => CorporateUser, (corporateUser) => corporateUser.user)
  corporateUser?: CorporateUser;
}
