import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Email } from '../../../entities/email';
import { EmailEntityRepository } from './email.entity.repository';
import { EmailEntityService } from './email.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Email])],
  providers: [EmailEntityService, EmailEntityRepository],
  exports: [EmailEntityService],
})
export class EmailEntityModule {}
