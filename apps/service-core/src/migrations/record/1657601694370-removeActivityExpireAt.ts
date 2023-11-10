import {MigrationInterface, QueryRunner} from "typeorm";

export class removeActivityExpireAt1657601694370 implements MigrationInterface {
    name = 'removeActivityExpireAt1657601694370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`expireAt\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`expireAt\` datetime NULL`);
    }

}
