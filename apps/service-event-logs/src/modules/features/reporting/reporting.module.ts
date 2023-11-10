import { Module } from '@nestjs/common';

import { FormSgTransactionEntityModule } from '../../entities/formsg-transaction/formsg-transaction.entity.module';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

@Module({
  imports: [FormSgTransactionEntityModule],
  providers: [ReportingService],
  controllers: [ReportingController],
})
export class ReportingModule {}
