import {MigrationInterface, QueryRunner} from "typeorm";

export class removeUserUnverifiedColumns1659618588014 implements MigrationInterface {
    name = 'removeUserUnverifiedColumns1659618588014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`unverifiedEmail\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`unverifiedPhoneNumber\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`unverifiedPhoneNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`unverifiedEmail\` varchar(255) NULL`);
    }

}
