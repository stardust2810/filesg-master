import { Module } from '@nestjs/common';

import { FormSgTransactionModule } from '../formsg-transaction/formsg-transaction.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [FormSgTransactionModule],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
