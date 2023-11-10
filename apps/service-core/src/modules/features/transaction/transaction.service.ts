import { TransactionStatusResponse } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly transactionEntityService: TransactionEntityService) {}

  public async retrieveTransactionStatus(transctionUuid: string, userId: number): Promise<TransactionStatusResponse> {
    const { status, type, activities, updatedAt } =
      await this.transactionEntityService.retrievePartialTransactionWithStatusInfoByUuidAndUserId(transctionUuid, userId);

    return { status, type, activities: activities!, updatedAt };
  }
}
