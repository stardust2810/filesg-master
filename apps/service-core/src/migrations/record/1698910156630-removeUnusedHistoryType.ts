import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedHistoryType1698910156630 implements MigrationInterface {
    name = 'RemoveUnusedHistoryType1698910156630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'delete', 'download', 'expire', 'viewed') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'share', 'unshare', 'delete', 'download', 'expire', 'viewed') NOT NULL`);
    }

}
