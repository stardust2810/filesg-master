import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUserRoleToStringForm1660102314294 implements MigrationInterface {
  name = 'updateUserRoleToStringForm1660102314294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'CITIZEN','USER', 'BETA_USER', 'TESTER', 'ADMIN', 'SUPER_ADMIN', '6', '5', '4', '3', '2', '1', '0') NOT NULL DEFAULT 'CITIZEN'`,
    );

    await this.patchData(queryRunner);

    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'CITIZEN') NOT NULL DEFAULT 'CITIZEN'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('USER', 'BETA_USER', 'TESTER', 'ADMIN', 'SUPER_ADMIN', 'PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', '6', '5', '4', '3', '2', '1', '0') NOT NULL DEFAULT '0'`,
    );
  }

  private async patchData(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE user SET role = 'CITIZEN' WHERE role = '0'`);
    await queryRunner.query(`UPDATE user SET role = 'PROGRAMMATIC_WRITE' WHERE role = '3' OR role = '6' or role= '4'`);
    await queryRunner.query(`UPDATE user SET role = 'PROGRAMMATIC_READ' WHERE role = '5'`);
  }
}
