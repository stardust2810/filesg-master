import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsBannedFromNonSingpassVerificationToActivity1658373899540 implements MigrationInterface {
    name = 'addIsBannedFromNonSingpassVerificationToActivity1658373899540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`isBannedFromNonSingpassVerification\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`isBannedFromNonSingpassVerification\``);
    }

}
