import {MigrationInterface, QueryRunner} from "typeorm";

export class refactorEservice1650281436855 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice\` DROP COLUMN \`status\``);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice\` ADD COLUMN \`status\``);
    }
}
