import {MigrationInterface, QueryRunner} from "typeorm";

export class addExpiredFileAssetStatus1658152733624 implements MigrationInterface {
    name = 'addExpiredFileAssetStatus1658152733624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'share', 'unshare', 'delete', 'download', 'expire') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'share', 'unshare', 'delete', 'download') NOT NULL`);
    }

}
