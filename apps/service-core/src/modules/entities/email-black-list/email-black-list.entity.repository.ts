import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

import { EmailBlackList } from '../../../entities/email-black-list';

@Injectable()
export class EmailBlackListEntityRepository {
  public constructor(
    @InjectRepository(EmailBlackList)
    private emailBlackListRepository: Repository<EmailBlackList>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(EmailBlackList) : this.emailBlackListRepository;
  }

  public async upsertByEmail(emailAddress: string, entityManager?: EntityManager) {
    const upsertOptions: UpsertOptions<EmailBlackList> = {
      conflictPaths: ['updatedAt'],
      skipUpdateIfNoValuesChanged: true,
    };
    return await this.getRepository(entityManager).upsert({ emailAddress }, upsertOptions);
  }
}
