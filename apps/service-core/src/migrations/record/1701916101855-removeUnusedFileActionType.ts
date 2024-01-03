import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedFileActionType1701916101855 implements MigrationInterface {
  name = 'RemoveUnusedFileActionType1701916101855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'deleted', 'delete', 'downloaded', 'download', 'expired', 'expire', 'viewed') NOT NULL`,
    );

    await queryRunner.query(`
    UPDATE file_asset_history
    SET type = 
      CASE
        WHEN type = 'delete' THEN 'deleted'
        WHEN type = 'expire' THEN 'expired'
        WHEN type = 'download' THEN 'downloaded'
        ELSE type
      END
  `);

    await queryRunner.query(
      `ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'deleted', 'downloaded', 'expired', 'viewed') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'deleted', 'delete', 'downloaded', 'download', 'expired', 'expire', 'viewed') NOT NULL`,
    );

    await queryRunner.query(`
      UPDATE file_asset_history
      SET type = 
        CASE
          WHEN type = 'deleted' THEN 'delete'
          WHEN type = 'expired' THEN 'expire'
          WHEN type = 'downloaded' THEN 'download'
          ELSE type
        END
    `);

    await queryRunner.query(
      `ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'delete', 'download', 'expire', 'viewed') NOT NULL`,
    );
  }
}
