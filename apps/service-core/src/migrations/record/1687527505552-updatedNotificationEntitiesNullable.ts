import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedNotificationEntitiesNullable1687527505552 implements MigrationInterface {
  name = 'updatedNotificationEntitiesNullable1687527505552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`application_type_notification\` DROP FOREIGN KEY \`FK_f28fcdc0ccbc87ad33375cd1e5a\``);
    await queryRunner.query(
      `ALTER TABLE \`application_type_notification\` CHANGE \`applicationTypeId\` \`applicationTypeId\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` DROP FOREIGN KEY \`FK_72bf78d69d80a62d97edbf10fff\``);
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template_audit\` CHANGE \`externalTemplateId\` \`externalTemplateId\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template_audit\` CHANGE \`notificationMessageTemplateId\` \`notificationMessageTemplateId\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP FOREIGN KEY \`FK_b3027617f6571299567061dd775\``);
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` CHANGE \`applicationTypeNotificationId\` \`applicationTypeNotificationId\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_d8b30006473280b3035d50d26d5\``);
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` CHANGE \`notificationMessageTemplateId\` \`notificationMessageTemplateId\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP FOREIGN KEY \`FK_904ad4826b46cd89528addc7dde\``);
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` CHANGE \`applicationTypeId\` \`applicationTypeId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`application_type_notification\` ADD CONSTRAINT \`FK_f28fcdc0ccbc87ad33375cd1e5a\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template_audit\` ADD CONSTRAINT \`FK_72bf78d69d80a62d97edbf10fff\` FOREIGN KEY (\`notificationMessageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` ADD CONSTRAINT \`FK_b3027617f6571299567061dd775\` FOREIGN KEY (\`applicationTypeNotificationId\`) REFERENCES \`application_type_notification\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_d8b30006473280b3035d50d26d5\` FOREIGN KEY (\`notificationMessageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` ADD CONSTRAINT \`FK_904ad4826b46cd89528addc7dde\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP FOREIGN KEY \`FK_904ad4826b46cd89528addc7dde\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_d8b30006473280b3035d50d26d5\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP FOREIGN KEY \`FK_b3027617f6571299567061dd775\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` DROP FOREIGN KEY \`FK_72bf78d69d80a62d97edbf10fff\``);
    await queryRunner.query(`ALTER TABLE \`application_type_notification\` DROP FOREIGN KEY \`FK_f28fcdc0ccbc87ad33375cd1e5a\``);
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` CHANGE \`applicationTypeId\` \`applicationTypeId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` ADD CONSTRAINT \`FK_904ad4826b46cd89528addc7dde\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` CHANGE \`notificationMessageTemplateId\` \`notificationMessageTemplateId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_d8b30006473280b3035d50d26d5\` FOREIGN KEY (\`notificationMessageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` CHANGE \`applicationTypeNotificationId\` \`applicationTypeNotificationId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` ADD CONSTRAINT \`FK_b3027617f6571299567061dd775\` FOREIGN KEY (\`applicationTypeNotificationId\`) REFERENCES \`application_type_notification\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template_audit\` CHANGE \`notificationMessageTemplateId\` \`notificationMessageTemplateId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template_audit\` CHANGE \`externalTemplateId\` \`externalTemplateId\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template_audit\` ADD CONSTRAINT \`FK_72bf78d69d80a62d97edbf10fff\` FOREIGN KEY (\`notificationMessageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE \`application_type_notification\` CHANGE \`applicationTypeId\` \`applicationTypeId\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`application_type_notification\` ADD CONSTRAINT \`FK_f28fcdc0ccbc87ad33375cd1e5a\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
