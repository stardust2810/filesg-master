import { RECIPIENT_ACTIVITY_TYPES } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Email } from '../../../entities/email';

@Injectable()
export class EmailEntityRepository {
  public constructor(
    @InjectRepository(Email)
    private emailEntityRepository: Repository<Email>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(Email) : this.emailEntityRepository;
  }

  public async findEmailByAwsMessageId(awsMessageId: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: {
        awsMessageId,
      },
    });
  }

  public async findEmailWithTransactionInfoByAwsMessageId(awsMessageId: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('email')
      .leftJoinAndSelect('email.activity', 'activity')
      .leftJoinAndSelect('activity.fileAssets', 'fileAssets')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('transaction.activities', 'activities')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .where('email.awsMessageId = :awsMessageId', { awsMessageId })
      .andWhere('activities.type IN(:...types)', { types: RECIPIENT_ACTIVITY_TYPES })
      .getOne();
  }

  public async findEmailRecordByActivityID(activityId: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).find({
      where: { activity: { uuid: activityId } },
      relations: ['activity'],
    });
  }
}
