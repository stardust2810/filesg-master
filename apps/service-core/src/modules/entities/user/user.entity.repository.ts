import { ACTIVATED_FILE_STATUSES, USER_TYPE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { User } from '../../../entities/user';

@Injectable()
export class UserEntityRepository {
  public constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(User) : this.userRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findUserWithEserviceAndAgencyById(id: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: { id },
      relations: ['eservices', 'eservices.agency'],
    });
  }

  public async findCountOnboardedCitizenUserTotalAndWithIssuedDocument(entityManager?: EntityManager) {
    const totalOnboardedCitizenUserCountAlias = 'totalOnboardedCitizenUserCount';
    const withDocumentCountAlias = 'withDocumentCount';

    const query = await this.getRepository(entityManager)
      .createQueryBuilder('user')
      .select(`COUNT(user.id) AS ${totalOnboardedCitizenUserCountAlias}`)
      .addSelect(
        (qb) =>
          qb
            .subQuery()
            .select('COUNT (DISTINCT user.id)')
            .from('user', 'user')
            .leftJoin('user.ownedfileAssets', 'fileAssets')
            .leftJoin('fileAssets.issuer', 'issuer')
            .where('user.type = :type', { type: USER_TYPE.CITIZEN })
            .andWhere('user.isOnboarded = true')
            .andWhere('fileAssets.status IN (:statuses)', { statuses: ACTIVATED_FILE_STATUSES })
            .andWhere('issuer.type = :issuerType', { issuerType: USER_TYPE.PROGRAMMATIC }),
        withDocumentCountAlias,
      )
      .where('user.type = :type', { type: USER_TYPE.CITIZEN })
      .andWhere('user.isOnboarded = true');

    return query.getRawOne<{ [totalOnboardedCitizenUserCountAlias]: string; [withDocumentCountAlias]: string }>();
  }
}
