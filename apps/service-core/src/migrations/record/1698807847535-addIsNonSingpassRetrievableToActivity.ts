import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIsNonSingpassRetrievableToActivity1698807847535 implements MigrationInterface {
  name = 'addIsNonSingpassRetrievableToActivity1698807847535';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`activity\` ADD \`isNonSingpassRetrievable\` tinyint NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`isNonSingpassRetrievable\``);
  }
}
