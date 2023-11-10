import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameAuditEventTable1683855997019 implements MigrationInterface {
  name = 'renameAuditEventTable1683855997019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`RENAME TABLE \`audit\` TO \`audit_event\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`RENAME TABLE \`audit_event\` TO \`audit\``);
  }
}
