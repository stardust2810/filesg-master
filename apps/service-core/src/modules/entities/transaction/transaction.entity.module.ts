import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from '../../../entities/transaction';
import { TransactionEntityRepository } from './transaction.entity.repository';
import { TransactionEntityService } from './transaction.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [TransactionEntityService, TransactionEntityRepository],
  exports: [TransactionEntityService],
})
export class TransactionEntityModule {}
