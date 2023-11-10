import {MigrationInterface, QueryRunner} from "typeorm";

export class removeIsAcceptedTNC1661826982972 implements MigrationInterface {
    name = 'removeIsAcceptedTNC1661826982972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`isAcceptedTNC\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`isAcceptedTNC\` tinyint NOT NULL DEFAULT '0'`);
    }

}
