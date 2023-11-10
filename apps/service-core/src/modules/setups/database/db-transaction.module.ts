import { Global, Module } from '@nestjs/common';

import { DatabaseTransactionService } from './db-transaction.service';

@Global()
@Module({
  providers: [DatabaseTransactionService],
  exports: [DatabaseTransactionService],
})
export class DatabaseTransactionModule {}
