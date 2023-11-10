import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveBackendFromIntegrationTypeEnum1694415887325 implements MigrationInterface {
    name = 'RemoveBackendFromIntegrationTypeEnum1694415887325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('formsg') NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('formsg') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('backend', 'formsg') NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` CHANGE \`integrationType\` \`integrationType\` enum ('backend', 'formsg') NULL`);
    }

}
