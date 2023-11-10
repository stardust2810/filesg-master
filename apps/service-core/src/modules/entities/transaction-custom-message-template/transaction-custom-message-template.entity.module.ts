import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionCustomMessageTemplate } from '../../../entities/transaction-custom-message-template';
import { TransactionCustomMessageTemplateEntityRepository } from './transaction-custom-message-template.entity.repository';
import { TransactionCustomMessageTemplateEntityService } from './transaction-custom-message-template.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionCustomMessageTemplate])],
  providers: [TransactionCustomMessageTemplateEntityService, TransactionCustomMessageTemplateEntityRepository],
  exports: [TransactionCustomMessageTemplateEntityService],
})
export class TransactionCustomMessageTemplateEntityModule {}
