import { OA_CERTIFICATE_STATUS, REVOCATION_TYPE } from '@filesg/common';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { CreateAttributesNoOmit } from '../typings/common';
import { TimestampableEntity } from './base-model';
import { FileAsset } from './file-asset';
import { User } from './user';

type OptionalAttributes = 'revocationType' | 'reason' | 'revokedBy' | 'revokedById' | 'fileAssets';
export type OaCertificateCreationModel = CreateAttributesNoOmit<OACertificate, OptionalAttributes>;
export type OaCertificateUpdateModel = Partial<OaCertificateCreationModel>;

@Entity()
export class OACertificate extends TimestampableEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  hash: string;

  @Column({ type: 'enum', enum: OA_CERTIFICATE_STATUS })
  status: OA_CERTIFICATE_STATUS;

  @Column({ type: 'enum', enum: REVOCATION_TYPE, nullable: true })
  revocationType: REVOCATION_TYPE | null;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  revokedBy?: User | null;

  @Column({ nullable: true })
  revokedById?: number | null;

  @OneToMany(() => FileAsset, (fileAsset) => fileAsset.oaCertificate)
  fileAssets?: FileAsset[];
}
