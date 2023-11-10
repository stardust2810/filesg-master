import {MigrationInterface, QueryRunner} from "typeorm";

export class addCodeToApplicationType1657075977732 implements MigrationInterface {
    name = 'addCodeToApplicationType1657075977732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`application_type\` ADD \`code\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`application_type\` ADD UNIQUE INDEX \`IDX_c11f09867d33ab9bea127b7fa8\` (\`code\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`application_type\` DROP INDEX \`IDX_c11f09867d33ab9bea127b7fa8\``);
        await queryRunner.query(`ALTER TABLE \`application_type\` DROP COLUMN \`code\``);
    }

}
