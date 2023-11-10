import {MigrationInterface, QueryRunner} from "typeorm";

export class removeProgrammaticUserSalt1657275855532 implements MigrationInterface {
    name = 'removeProgrammaticUserSalt1657275855532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`salt\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`salt\` varchar(255) NULL`);
    }

}
