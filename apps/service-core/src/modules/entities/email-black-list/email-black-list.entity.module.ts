import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailBlackList } from '../../../entities/email-black-list';
import { EmailBlackListEntityRepository } from './email-black-list.entity.repository';
import { EmailBlackListEntityService } from './email-black-list.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailBlackList])],
  providers: [EmailBlackListEntityService, EmailBlackListEntityRepository],
  exports: [EmailBlackListEntityService],
})
export class EmailBlackListEntityModule {}
