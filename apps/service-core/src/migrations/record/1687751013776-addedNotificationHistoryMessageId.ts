import { MigrationInterface, QueryRunner } from "typeorm";

export class addedNotificationHistoryMessageId1687751013776 implements MigrationInterface {
    name = 'addedNotificationHistoryMessageId1687751013776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_history\` ADD \`messageId\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_history\` DROP COLUMN \`messageId\``);
    }

}
