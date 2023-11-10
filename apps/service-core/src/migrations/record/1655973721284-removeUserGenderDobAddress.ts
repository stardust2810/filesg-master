import {MigrationInterface, QueryRunner} from "typeorm";

export class removeUserGenderDobAddress1655973721284 implements MigrationInterface {
    name = 'removeUserGenderDobAddress1655973721284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`gender\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`dob\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`dob\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`gender\` enum ('unknown', 'male', 'female', 'notApplicable') NOT NULL`);
    }

}
