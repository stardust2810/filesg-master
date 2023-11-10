import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRolesToUserRoles1658390663750 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('USER', 'BETA_USER', 'TESTER', 'ADMIN', 'SUPER_ADMIN', 'PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', '6', '5', '4', '3', '2', '1', '0') NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('USER', 'BETA_USER', 'TESTER', 'ADMIN', 'SUPER_ADMIN', '4', '3', '2', '1', '0') NOT NULL DEFAULT '0'`,
    );
  }
}
