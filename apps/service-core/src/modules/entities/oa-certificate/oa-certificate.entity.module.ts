import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OACertificate } from '../../../entities/oa-certificate';
import { OaCertificateEntityRepository } from './oa-certificate.entity.repository';
import { OaCertificateEntityService } from './oa-certificate.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([OACertificate])],
  providers: [OaCertificateEntityService, OaCertificateEntityRepository],
  exports: [OaCertificateEntityService],
})
export class OaCertificateEntityModule {}
