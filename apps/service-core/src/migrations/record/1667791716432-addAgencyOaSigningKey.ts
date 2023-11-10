import { MigrationInterface, QueryRunner } from "typeorm";

export class addAgencyOaSigningKey1667791716432 implements MigrationInterface {
    name = 'addAgencyOaSigningKey1667791716432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`agency\` ADD \`oaSigningKey\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`agency\` DROP COLUMN \`oaSigningKey\``);
    }

}
