import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateApplicationTypesToEservice1685583421998 implements MigrationInterface {
  name = 'updateApplicationTypesToEservice1685583421998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`application_type\` ADD \`eserviceId\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`application_type\` ADD CONSTRAINT \`FK_83d76cd4d2bcaf50d2bc6b99c25\` FOREIGN KEY (\`eserviceId\`) REFERENCES \`eservice\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `UPDATE application_type, eservice_application_type SET application_type.eserviceId = eservice_application_type.eserviceId WHERE eservice_application_type.applicationTypeId = application_type.id;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`application_type\` DROP FOREIGN KEY \`FK_83d76cd4d2bcaf50d2bc6b99c25\``);
    await queryRunner.query(`ALTER TABLE \`application_type\` DROP COLUMN \`eserviceId\``);
  }
}
