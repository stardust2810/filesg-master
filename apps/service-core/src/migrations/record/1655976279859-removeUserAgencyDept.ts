import {MigrationInterface, QueryRunner} from "typeorm";

export class removeUserAgencyDept1655976279859 implements MigrationInterface {
    name = 'removeUserAgencyDept1655976279859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`agencyDept\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`agencyDept\` varchar(255) NULL`);
    }

}
