import { Module } from '@nestjs/common';

import { EmailEntityModule } from '../../entities/email/email.entity.module';
import { EmailBlackListEntityModule } from '../../entities/email-black-list/email-black-list.entity.module';
import { AwsModule } from '../aws/aws.module';
import { EmailBlackListService } from './email-black-list.service';

@Module({
  providers: [EmailBlackListService],
  exports: [EmailBlackListService],
  imports: [AwsModule, EmailEntityModule, EmailBlackListEntityModule],
})
export class EmailModule {}
