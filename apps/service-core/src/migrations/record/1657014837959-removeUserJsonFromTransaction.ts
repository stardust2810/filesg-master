import {MigrationInterface, QueryRunner} from "typeorm";

export class removeUserJsonFromTransaction1657014837959 implements MigrationInterface {
    name = 'removeUserJsonFromTransaction1657014837959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`userJson\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`userJson\` json NOT NULL`);
    }

}
