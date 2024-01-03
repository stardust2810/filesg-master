import { FILE_FAIL_CATEGORY, FILE_STATUS, FILE_TYPE, Metadata } from '@filesg/common';
import { AfterLoad, Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes, FILE_ASSET_TYPE } from '../typings/common';
import { Activity } from './activity';
import { TimestampableEntity } from './base-model';
import { FileAssetHistory } from './file-asset-history';
import { OACertificate } from './oa-certificate';
import { User } from './user';

type OptionalAttributes =
  | 'documentHash'
  | 'failCategory'
  | 'failReason'
  | 'metadata'
  | 'expireAt'
  | 'deleteAt'
  | 'isPasswordEncrypted'
  | 'children'
  | 'histories'
  | 'parent'
  | 'owner'
  | 'issuer'
  | 'oaCertificate'
  | 'activities'
  | 'ownerId'
  | 'issuerId'
  | 'parentId'
  | 'oaCertificateId'
type OmitAttributes = 'id' | 'uuid' | 'transformDates';
export type FileAssetCreationModel = CreationAttributes<FileAsset, OptionalAttributes, OmitAttributes>;
export type FileAssetUpdateModel = Partial<FileAssetCreationModel>;

@Entity()
@Index(['status', 'deleteAt'])
export class FileAsset extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  documentHash: string | null;

  @Column({ type: 'enum', enum: Object.values(FILE_TYPE) })
  documentType: FILE_TYPE;

  @Column({ type: 'enum', enum: Object.values(FILE_ASSET_TYPE) })
  type: FILE_ASSET_TYPE;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'enum', enum: Object.values(FILE_STATUS) })
  status: FILE_STATUS;

  @Column({ type: 'enum', enum: Object.values(FILE_FAIL_CATEGORY), nullable: true })
  failCategory: FILE_FAIL_CATEGORY | null;

  @Column({ type: 'longtext', nullable: true })
  failReason: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Metadata | null;

  /**
   * expireAt date is the last date where the fileAsset is still valid.
   * Expiry will occur on the next day.
   *
   * @example // Given today's date = 30/01/2023
   * expireAt = '31/01/2023' // fileAsset is still valid
   * expireAt = '30/01/2023' // fileAsset is still valid
   * expireAt = '29/01/2023' // fileAsset has expired
   */
  @Column({ type: 'date', nullable: true })
  expireAt: Date | null;

  /**
   * deleteAt date is the date where the deletion of fileAsset occurs.
   *
   * @example // Given today's date = 30/01/2023
   * deleteAt = '31/01/2023' // fileAsset is still active
   * deleteAt = '30/01/2023' // fileAsset will be deleted
   * deleteAt = '29/01/2023' // fileAsset will be deleted
   */
  @Column({ type: 'date', nullable: true })
  deleteAt: Date | null;

  @Column({ type: 'bool', default: false })
  isPasswordEncrypted: boolean;

  @OneToMany(() => FileAsset, (fileAsset) => fileAsset.parent)
  children?: FileAsset[];

  @OneToMany(() => FileAssetHistory, (fileAssetHistory) => fileAssetHistory.fileAsset)
  histories?: FileAssetHistory[];

  @ManyToOne(() => FileAsset, (fileAsset) => fileAsset.children, { nullable: true })
  parent?: FileAsset | null;

  @ManyToOne(() => User, (user) => user.ownedfileAssets, { nullable: false })
  owner?: User;

  @ManyToOne(() => User, (user) => user.issuedFileAssets, { nullable: true })
  issuer?: User | null;

  @ManyToOne(() => OACertificate, (oaCertificate) => oaCertificate.fileAssets, { nullable: true })
  oaCertificate?: OACertificate | null;

  @ManyToMany(() => Activity, (activity) => activity.fileAssets)
  activities?: Activity[];

  @Column({ nullable: false })
  ownerId: number;

  @Column({ nullable: false })
  issuerId: number;

  @Column({ nullable: true })
  parentId: number | null;

  @Column({ nullable: true })
  oaCertificateId: string | null;

  /**
   * Typeorm stores type:date as string
   */
  @AfterLoad()
  transformDates() {
    if (this.expireAt) {
      this.expireAt = new Date(this.expireAt);
    }

    if (this.deleteAt) {
      this.deleteAt = new Date(this.deleteAt);
    }
  }
}
