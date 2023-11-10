import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToEserviceWhitelistedUser1692967924748 implements MigrationInterface {
    name = 'AddStatusToEserviceWhitelistedUser1692967924748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice_whitelisted_user\` ADD \`status\` enum ('active', 'inactive') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice_whitelisted_user\` DROP COLUMN \`status\``);
    }

}
