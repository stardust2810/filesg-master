import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedNotificationTemplateInputCol1686292665787 implements MigrationInterface {
  name = 'updatedNotificationTemplateInputCol1686292665787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` ADD \`notificationMessageTemplateId\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_d8b30006473280b3035d50d26d5\` FOREIGN KEY (\`notificationMessageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_6eaebf565536b652c5be59e15ef\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP COLUMN \`messageTemplateId\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_d8b30006473280b3035d50d26d5\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP COLUMN \`notificationMessageTemplateId\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` ADD \`messageTemplateId\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_6eaebf565536b652c5be59e15ef\` FOREIGN KEY (\`messageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
