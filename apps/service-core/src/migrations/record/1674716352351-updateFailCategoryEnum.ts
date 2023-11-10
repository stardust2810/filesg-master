import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateFailCategoryEnum1674716352351 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`file_asset\` CHANGE \`failCategory\` \`failCategory\` enum ('virus', 'scanError', 'uploadToStaging', 'uploadMove', 'transferMove', 'deletion') NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`file_asset\` CHANGE \`failCategory\` \`failCategory\` enum ('virus', 'scanError', 'uploadToStaging', 'uploadMove', 'transferMove') NULL`,
    );
  }
}
