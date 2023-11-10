import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Agency } from '../../../entities/agency';
import { AgencyEntityRepository } from './agency.entity.repository';
import { AgencyEntityService } from './agency.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Agency])],
  providers: [AgencyEntityService, AgencyEntityRepository], // prettier-ignore
  exports: [AgencyEntityService],
})
export class AgencyEntityModule {}
