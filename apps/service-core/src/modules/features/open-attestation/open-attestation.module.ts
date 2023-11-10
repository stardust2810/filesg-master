import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OACertificate } from '../../../entities/oa-certificate';
import { AgencyEntityModule } from '../../entities/agency/agency.entity.module';
import { OaCertificateEntityModule } from '../../entities/oa-certificate/oa-certificate.entity.module';
import { OpenAttestationController } from './open-attestation.controller';
import { OpenAttestationService } from './open-attestation.service';

@Module({
  imports: [TypeOrmModule.forFeature([OACertificate]), AgencyEntityModule, OaCertificateEntityModule],
  providers: [OpenAttestationService],
  controllers: [OpenAttestationController],
  exports: [OpenAttestationService],
})
export class OpenAttestationModule {}
