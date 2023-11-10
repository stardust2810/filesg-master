import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationType } from '../../../entities/application-type';
import { ApplicationTypeEntityRepository } from './application-type.entity.repository';
import { ApplicationTypeEntityService } from './application-type.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationType])],
  providers: [ApplicationTypeEntityService, ApplicationTypeEntityRepository],
  exports: [ApplicationTypeEntityService],
})
export class ApplicationTypeEntityModule {}
