import {MigrationInterface, QueryRunner} from "typeorm";

export class updatedCustomAgencyMessageType1660536269314 implements MigrationInterface {
    name = 'updatedCustomAgencyMessageType1660536269314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`customAgencyMessage\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`customAgencyMessage\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`customAgencyMessage\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`customAgencyMessage\` text NULL`);
    }

}
