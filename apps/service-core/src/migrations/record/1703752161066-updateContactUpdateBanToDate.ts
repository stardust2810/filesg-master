import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateContactUpdateBanToDate1703752161066 implements MigrationInterface {
  name = 'UpdateContactUpdateBanToDate1703752161066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`isBannedFromContactUpdate\``);
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`contactUpdateBannedUntil\` datetime NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`contactUpdateBannedUntil\``);
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`isBannedFromContactUpdate\` tinyint NOT NULL DEFAULT '0'`);
  }
}
