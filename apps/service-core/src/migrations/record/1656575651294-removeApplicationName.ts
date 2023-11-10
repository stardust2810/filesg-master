import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeApplicationName1656575651294 implements MigrationInterface {
  name = 'removeApplicationName1656575651294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX \`FK_598c9847c5af2155aeff71091c\` ON \`application\` (\`eserviceId\`)`);
    await queryRunner.query(`DROP INDEX \`composite\` ON \`application\``);
    await queryRunner.query(`ALTER TABLE \`application\` DROP COLUMN \`name\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`application\` ADD \`name\` varchar(255) NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX \`composite\` ON \`application\` (\`eserviceId\`, \`name\`)`);
    await queryRunner.query(`DROP INDEX \`FK_598c9847c5af2155aeff71091c\` ON \`application\``);
  }
}
