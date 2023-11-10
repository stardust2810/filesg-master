import { MigrationInterface, QueryRunner } from 'typeorm';

export class eserviceAndApplication1652442299182 implements MigrationInterface {
  name = 'eserviceAndApplication1652442299182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`eservice\` ADD \`code\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`eservice\` ADD \`emailAdditionalText\` text NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`application\` ADD \`externalRefId\` varchar(255) NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`application\` DROP COLUMN \`externalRefId\``);
    await queryRunner.query(`ALTER TABLE \`eservice\` DROP COLUMN \`emailAdditionalText\``);
    await queryRunner.query(`ALTER TABLE \`eservice\` DROP COLUMN \`code\``);
  }
}
