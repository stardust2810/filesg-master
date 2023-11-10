import {MigrationInterface, QueryRunner} from "typeorm";

export class removeFileAssetPathAndThumbnail1656656022668 implements MigrationInterface {
    name = 'removeFileAssetPathAndThumbnail1656656022668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`path\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`thumbnailPath\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`thumbnailPath\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`path\` varchar(255) NULL`);
    }

}
