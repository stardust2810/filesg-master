import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLastViewedAtToFileAssets1657253045801 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`lastViewedAt\` DATETIME`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`lastViewedAt\``);
  }
}
