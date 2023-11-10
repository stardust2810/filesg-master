import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CreationAttributesNoOptional } from '../typings/common';
import { TimestampableEntity } from './base-model';
import { FileAsset } from './file-asset';

type OmitAttributes = 'id';
export type FileAssetAccessCreationModel = CreationAttributesNoOptional<FileAssetAccess, OmitAttributes>;

@Entity()
export class FileAssetAccess extends TimestampableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  token: string;

  @ManyToOne(() => FileAsset, (fileAsset) => fileAsset.id, { nullable: false })
  fileAsset: FileAsset;
}
