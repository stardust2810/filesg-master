import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBackendToIntegrationTypeEnum1694071116309 implements MigrationInterface {
    name = 'AddBackendToIntegrationTypeEnum1694071116309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('backend', 'formsg') NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('backend', 'formsg') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('FORMSG') NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('FORMSG') NULL`);
    }

}
