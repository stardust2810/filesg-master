import { FILE_ASSET_ACTION } from '@filesg/common';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributes } from '../typings/common';
import { TimestampableEntity } from './base-model';
import { FileAsset } from './file-asset';
import { User } from './user';

type OptionalAttributes = 'actionBy' | 'actionTo' | 'fileAsset' | 'fileAssetId' | 'actionById' | 'actionToId' | 'lastViewedAt';
type OmitAttributes = 'id' | 'uuid';
export type FileAssetHistoryCreationModel = CreationAttributes<FileAssetHistory, OptionalAttributes, OmitAttributes>;

@Entity()
export class FileAssetHistory extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'datetime', nullable: true })
  lastViewedAt: Date | null;

  @Column({ type: 'enum', enum: Object.values(FILE_ASSET_ACTION) })
  type: FILE_ASSET_ACTION;

  @ManyToOne(() => User, (user) => user, { nullable: false })
  actionBy?: User;

  @ManyToOne(() => User, (user) => user, { nullable: true })
  actionTo?: User | null;

  @ManyToOne(() => FileAsset, (fileAsset) => fileAsset.histories, { nullable: false })
  fileAsset?: FileAsset;

  @Column({ nullable: false })
  fileAssetId: number;

  @Column({ nullable: false })
  actionById: number;

  @Column({ nullable: true })
  actionToId: number;
}
