import { MigrationInterface, QueryRunner } from "typeorm";

export class updatedNotificationHistoryStatusCol1686226116803 implements MigrationInterface {
    name = 'updatedNotificationHistoryStatusCol1686226116803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY') NOT NULL`);
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
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY', '0', '1') NOT NULL`);
    }

}
