import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCreationMethodToNonNullable1703208992327 implements MigrationInterface {
  name = 'UpdateCreationMethodToNonNullable1703208992327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`creationMethod\` \`creationMethod\` enum ('system', 'api', 'sftp', 'formsg') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`creationMethod\` \`creationMethod\` enum ('system', 'api', 'sftp', 'formsg') NULL`,
    );
  }
}
