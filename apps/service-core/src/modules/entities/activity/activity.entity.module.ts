import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activity } from '../../../entities/activity';
import { ActivityEntityRepository } from './activity.entity.repository';
import { ActivityEntityService } from './activity.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  providers: [ActivityEntityService, ActivityEntityRepository],
  exports: [ActivityEntityService],
})
export class ActivityEntityModule {}
