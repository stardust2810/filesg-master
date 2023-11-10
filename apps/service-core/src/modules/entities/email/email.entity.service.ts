import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Email, EmailCreationModel } from '../../../entities/email';
import { EmailEntityRepository } from './email.entity.repository';

@Injectable()
export class EmailEntityService {
  private logger = new Logger(EmailEntityService.name);

  constructor(private readonly emailEntityRepository: EmailEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildEmail(emailModel: EmailCreationModel) {
    return this.emailEntityRepository.getRepository().create({
      ...emailModel,
    });
  }

  public async saveEmails(emailModels: EmailCreationModel[], entityManager?: EntityManager) {
    const emails = emailModels.map((model) => this.buildEmail(model));
    return await this.emailEntityRepository.getRepository(entityManager).save(emails);
  }

  public async saveEmail(emailModel: EmailCreationModel, entityManager?: EntityManager) {
    return (await this.saveEmails([emailModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retriveEmailByAwsMessageId(uuid: string, opts?: ServiceMethodThrowOptions): Promise<Email>;
  public async retriveEmailByAwsMessageId(uuid: string, opts?: ServiceMethodDontThrowOptions): Promise<Email | null>;
  public async retriveEmailByAwsMessageId(awsMessageId: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const email = await this.emailEntityRepository.findEmailByAwsMessageId(awsMessageId, opts.entityManager);

    if (!email && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.EMAIL_SERVICE, Email.name, 'awsMessageId', `${awsMessageId}`);
    }

    return email;
  }

  public async retrieveEmailWithTransactionInfoByAwsMessageId(awsMessageId: string, opts?: ServiceMethodThrowOptions): Promise<Email>;
  public async retrieveEmailWithTransactionInfoByAwsMessageId(
    awsMessageId: string,
    opts?: ServiceMethodDontThrowOptions,
  ): Promise<Email | null>;
  public async retrieveEmailWithTransactionInfoByAwsMessageId(awsMessageId: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const email = await this.emailEntityRepository.findEmailWithTransactionInfoByAwsMessageId(awsMessageId, opts.entityManager);

    if (!email && opts.toThrow) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.EMAIL_SERVICE,
        `${Email.name} with transactionInfo`,
        'awsMessageId',
        `${awsMessageId}`,
      );
    }

    return email;
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateEmailTransactionalStatus(awsMessageId: string, eventType: string, subEventType?: string | null) {
    const dataToUpdate: Partial<Email> = {
      eventType,
    };

    if (subEventType) {
      dataToUpdate.subEventType = subEventType;
    }

    await this.emailEntityRepository.getRepository().update({ awsMessageId }, dataToUpdate);
  }
}
