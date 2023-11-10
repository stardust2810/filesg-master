import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseTransactionService {
  constructor(private readonly connection: Connection) {}

  public async startTransaction() {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    return {
      queryRunner,
      entityManager: queryRunner.manager,
      commit: async function () {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      },
      rollback: async function () {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      },
    };
  }
}
