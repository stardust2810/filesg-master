import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Eservice } from '../../../entities/eservice';
import { EserviceEntityRepository } from './eservice.entity.repository';
import { EserviceEntityService } from './eservice.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Eservice])],
  providers: [EserviceEntityService, EserviceEntityRepository],
  exports: [EserviceEntityService],
})
export class EserviceEntityModule {}
