import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeTransactionCategoryAndExpireAt1656570394550 implements MigrationInterface {
  name = 'removeTransactionCategoryAndExpireAt1656570394550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`category\``);
    await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`expireAt\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`expireAt\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`category\` enum ('file', 'future development') NOT NULL`);
  }
}
