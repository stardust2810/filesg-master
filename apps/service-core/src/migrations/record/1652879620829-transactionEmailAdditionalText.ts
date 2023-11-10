import { MigrationInterface, QueryRunner } from 'typeorm';

export class transactionEmailAdditionalText1652879620829 implements MigrationInterface {
  name = 'transactionEmailAdditionalText1652879620829';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`eservice\` DROP COLUMN \`code\``);
    await queryRunner.query(`ALTER TABLE \`eservice\` DROP COLUMN \`emailAdditionalText\``);
    await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`emailAdditionalText\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`emailAdditionalText\``);
    await queryRunner.query(`ALTER TABLE \`eservice\` ADD \`emailAdditionalText\` text NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`eservice\` ADD \`code\` varchar(255) NOT NULL`);
  }
}
