import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFormsgToCreationMethodEnum1690877519110 implements MigrationInterface {
    name = 'AddedFormsgToCreationMethodEnum1690877519110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`creationMethod\` \`creationMethod\` enum ('system', 'api', 'sftp', 'formsg') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`creationMethod\` \`creationMethod\` enum ('system', 'api', 'sftp') NULL`);
    }

}
