import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCopyRecipientSubjectAffix1700188233391 implements MigrationInterface {
  name = 'AddCopyRecipientSubjectAffix1700188233391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` ADD \`copyRecipientSubjectAffix\` varchar(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP COLUMN \`copyRecipientSubjectAffix\``);
  }
}
