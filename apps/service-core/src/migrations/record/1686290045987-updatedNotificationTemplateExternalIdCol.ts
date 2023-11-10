import { MigrationInterface, QueryRunner } from "typeorm";

export class updatedNotificationTemplateExternalIdCol1686290045987 implements MigrationInterface {
    name = 'updatedNotificationTemplateExternalIdCol1686290045987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_071d21f1a1992ebd6278f26161\` ON \`notification_message_template\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`externalTemplateId\` \`externalTemplateId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`application_type_notification\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_history\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_history\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`notification_history\` ADD \`status\` enum ('SUCCESS', 'FAILED', '0', '1') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_history\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`notification_history\` ADD \`status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_history\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY', '0', '1') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`application_type_notification\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY', '0', '1') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`externalTemplateId\` \`externalTemplateId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY', '0', '1') NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_071d21f1a1992ebd6278f26161\` ON \`notification_message_template\` (\`externalTemplateId\`)`);
    }

}
