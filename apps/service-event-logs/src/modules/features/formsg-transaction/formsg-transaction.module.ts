import { Module } from '@nestjs/common';

import { FormSgTransactionEntityModule } from '../../entities/formsg-transaction/formsg-transaction.entity.module';
import { AwsModule } from '../aws/aws.module';
import { FormSgTransactionService } from './formsg-transaction.service';

@Module({
  imports: [FormSgTransactionEntityModule, AwsModule],
  providers: [FormSgTransactionService],
  exports: [FormSgTransactionService],
})
export class FormSgTransactionModule {}
