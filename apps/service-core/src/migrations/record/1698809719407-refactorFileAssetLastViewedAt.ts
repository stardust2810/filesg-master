import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorFileAssetLastViewedAt1698809719407 implements MigrationInterface {
  name = 'RefactorFileAssetLastViewedAt1698809719407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD \`lastViewedAt\` datetime NULL`);
    await queryRunner.query(
      `ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'share', 'unshare', 'delete', 'download', 'expire', 'viewed') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'share', 'unshare', 'delete', 'download', 'expire') NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP COLUMN \`lastViewedAt\``);
  }
}
