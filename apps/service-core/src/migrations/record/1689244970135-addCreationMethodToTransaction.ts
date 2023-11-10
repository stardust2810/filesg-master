import { MigrationInterface, QueryRunner } from "typeorm";

export class addCreationMethodToTransaction1689244970135 implements MigrationInterface {
    name = 'addCreationMethodToTransaction1689244970135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`creationMethod\` enum ('system', 'api', 'sftp') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`creationMethod\``);
    }

}
