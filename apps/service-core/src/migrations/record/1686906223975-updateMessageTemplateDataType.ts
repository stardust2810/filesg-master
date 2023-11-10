import { MigrationInterface, QueryRunner } from "typeorm";

export class updateMessageTemplateDataType1686906223975 implements MigrationInterface {
    name = 'updateMessageTemplateDataType1686906223975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` DROP COLUMN \`template\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` ADD \`template\` json NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP COLUMN \`template\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` ADD \`template\` json NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP COLUMN \`template\``);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` ADD \`template\` json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP COLUMN \`template\``);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` ADD \`template\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP COLUMN \`template\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` ADD \`template\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` DROP COLUMN \`template\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` ADD \`template\` text NOT NULL`);
    }

}
