import {MigrationInterface, QueryRunner} from "typeorm";

export class changeFileAssetExpireAtToTypDate1657841844449 implements MigrationInterface {
    name = 'changeFileAssetExpireAtToTypDate1657841844449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`expireAt\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`expireAt\` date NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`expireAt\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`expireAt\` datetime NULL`);
    }

}
