import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsBannedFromContactUpdateToUser1659432326000 implements MigrationInterface {
    name = 'addIsBannedFromContactUpdateToUser1659432326000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`isBannedFromContactUpdate\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`isBannedFromContactUpdate\``);
    }

}
