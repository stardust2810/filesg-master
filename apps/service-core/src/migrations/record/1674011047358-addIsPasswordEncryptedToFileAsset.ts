import { MigrationInterface, QueryRunner } from "typeorm";

export class addIsPasswordEncryptedToFileAsset1674011047358 implements MigrationInterface {
    name = 'addIsPasswordEncryptedToFileAsset1674011047358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`isPasswordEncrypted\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`isPasswordEncrypted\``);
    }

}
