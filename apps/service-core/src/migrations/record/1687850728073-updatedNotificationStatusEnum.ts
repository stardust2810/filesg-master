import { MigrationInterface, QueryRunner } from "typeorm";

export class updatedNotificationStatusEnum1687850728073 implements MigrationInterface {
    name = 'updatedNotificationStatusEnum1687850728073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_history\` CHANGE \`status\` \`status\` enum ('init', 'success', 'failed') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_history\` CHANGE \`status\` \`status\` enum ('success', 'failed') NOT NULL`);
    }

}
