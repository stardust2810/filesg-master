import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { EmailBlackList } from '../../../entities/email-black-list';
import { EmailBlackListEntityRepository } from './email-black-list.entity.repository';

@Injectable()
export class EmailBlackListEntityService {
  private logger = new Logger(EmailBlackListEntityService.name);

  constructor(private readonly emailBlackListEntityRepository: EmailBlackListEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public async upsertByEmail(emailAddress: string, entityManager?: EntityManager) {
    return await this.emailBlackListEntityRepository.upsertByEmail(emailAddress, entityManager);
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveBlackListedEmail(emailAddress: string, opts?: ServiceMethodThrowOptions): Promise<EmailBlackList>;
  public async retrieveBlackListedEmail(emailAddress: string, opts?: ServiceMethodDontThrowOptions): Promise<EmailBlackList | null>;
  public async retrieveBlackListedEmail(emailAddress: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const email = await this.emailBlackListEntityRepository.getRepository(opts.entityManager).findOne({
      where: {
        emailAddress,
      },
    });

    if (!email && opts.toThrow) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.EMAIL_BLACK_LIST_SERVICE,
        EmailBlackList.name,
        'emailAddress',
        `${emailAddress}`,
      );
    }

    return email;
  }

  // ===========================================================================
  // Update
  // ===========================================================================

  // ===========================================================================
  // Delete
  // ===========================================================================
  public async deleteBlackListedEmail(emailAddress: string, entityManager?: EntityManager) {
    await this.emailBlackListEntityRepository.getRepository(entityManager).delete({ emailAddress });
  }
}
