import { EntityNotFoundException, LogMethod } from '@filesg/backend-common';
import { ACTIVITY_TYPE, COMPONENT_ERROR_CODE } from '@filesg/common';
import { UpdateUserEmailForTransactionRequest } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';

@Injectable()
export class RecipientService {
  private readonly logger = new Logger(RecipientService.name);

  constructor(
    private readonly transactionEntityService: TransactionEntityService,
    private readonly activityEntityService: ActivityEntityService,
  ) {}

  @LogMethod()
  public async updateUserEmailForTransactionId(updateReqBody: UpdateUserEmailForTransactionRequest, entityManager?: EntityManager) {
    const { transactionId, uin, email } = updateReqBody;
    const transaction = await this.transactionEntityService.retrieveTransactionWithActivitiesAndOwnersByUuidAndActivityType(
      transactionId,
      ACTIVITY_TYPE.RECEIVE_TRANSFER,
      entityManager,
    );

    const activity = transaction.activities!.find((activity) => activity.user!.uin === uin);

    if (!activity) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Activity user', 'uin', uin);
    }

    return await this.activityEntityService.updateActivityRecipientInfo(
      activity.uuid,
      { ...activity.recipientInfo!, email },
      entityManager,
    );
  }
}
