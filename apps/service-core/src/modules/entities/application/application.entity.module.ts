import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Application } from '../../../entities/application';
import { ApplicationEntityRepository } from './application.entity.repository';
import { ApplicationEntityService } from './application.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  providers: [ApplicationEntityService, ApplicationEntityRepository],
  exports: [ApplicationEntityService],
})
export class ApplicationEntityModule {}
