import { MigrationInterface, QueryRunner } from "typeorm";

export class addAgencyIdentityProofLocation1667983652316 implements MigrationInterface {
    name = 'addAgencyIdentityProofLocation1667983652316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`agency\` ADD \`identityProofLocation\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`agency\` DROP COLUMN \`identityProofLocation\``);
    }

}
