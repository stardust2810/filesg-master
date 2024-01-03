import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCopyRecipientSubjectAffixToAudit1702438023415 implements MigrationInterface {
  name = 'AddCopyRecipientSubjectAffixToAudit1702438023415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` ADD \`copyRecipientSubjectAffix\` varchar(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` DROP COLUMN \`copyRecipientSubjectAffix\``);
  }
}
