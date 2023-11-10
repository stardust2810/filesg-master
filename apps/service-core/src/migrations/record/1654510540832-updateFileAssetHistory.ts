import {MigrationInterface, QueryRunner} from "typeorm";

export class updateFileAssetHistory1654510540832 implements MigrationInterface {
    name = 'updateFileAssetHistory1654510540832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD \`uuid\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD UNIQUE INDEX \`IDX_11d84670efe9c161c1d66e8842\` (\`uuid\`)`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('delete', 'move', 'upload', 'share', 'rename', 'created', 'download') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('delete', 'move', 'upload', 'share', 'rename', 'download') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP INDEX \`IDX_11d84670efe9c161c1d66e8842\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP COLUMN \`uuid\``);
    }

}
