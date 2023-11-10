import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateForFormSGIntegration1690447866174 implements MigrationInterface {
    name = 'UpdateForFormSGIntegration1690447866174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`eservice_whitelisted_user\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`eserviceUserId\` int NOT NULL, UNIQUE INDEX \`IDX_258f6a549d527e1cd926c8e7b0\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` ADD \`integrationType\` enum ('FORMSG') NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` ADD \`integrationType\` enum ('FORMSG') NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'programmatic', 'eservice') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'SYSTEM', 'CITIZEN', 'PROGRAMMATIC_SYSTEM_INTEGRATION', 'FORMSG') NOT NULL DEFAULT 'CITIZEN'`);
        await queryRunner.query(`ALTER TABLE \`eservice_whitelisted_user\` ADD CONSTRAINT \`FK_07f8446fce5ecdee21e9e278178\` FOREIGN KEY (\`eserviceUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice_whitelisted_user\` DROP FOREIGN KEY \`FK_07f8446fce5ecdee21e9e278178\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'SYSTEM', 'CITIZEN') NOT NULL DEFAULT 'CITIZEN'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'programmatic') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP COLUMN \`integrationType\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP COLUMN \`integrationType\``);
        await queryRunner.query(`DROP INDEX \`IDX_258f6a549d527e1cd926c8e7b0\` ON \`eservice_whitelisted_user\``);
        await queryRunner.query(`DROP TABLE \`eservice_whitelisted_user\``);
    }

}
