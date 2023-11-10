import { MigrationInterface, QueryRunner } from "typeorm";

export class addSystemRole1669876266298 implements MigrationInterface {
    name = 'addSystemRole1669876266298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'SYSTEM', 'CITIZEN') NOT NULL DEFAULT 'CITIZEN'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'CITIZEN') NOT NULL DEFAULT 'CITIZEN'`);
    }

}
