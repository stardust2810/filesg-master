import {MigrationInterface, QueryRunner} from "typeorm";

export class removeFileAssetPermission1656656903943 implements MigrationInterface {
    name = 'removeFileAssetPermission1656656903943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`permission\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`permission\` enum ('full', 'read', 'share', 'download') NOT NULL`);
    }

}
