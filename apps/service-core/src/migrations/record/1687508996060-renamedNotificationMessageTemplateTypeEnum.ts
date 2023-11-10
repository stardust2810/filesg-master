import { MigrationInterface, QueryRunner } from "typeorm";

export class renamedNotificationMessageTemplateTypeEnum1687508996060 implements MigrationInterface {
    name = 'renamedNotificationMessageTemplateTypeEnum1687508996060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION', 'REVOCATION', '0', '1', '2', '3') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION', 'REVOCATION', '0', '1', '2', '3') NOT NULL`);
    }

}
