import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecallToEmailTypesEnum1694415699187 implements MigrationInterface {
  name = 'AddRecallToEmailTypesEnum1694415699187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusOrScanError', 'cancellation', 'verifyEmail', 'emailDeliveryFailed', 'deletion', 'recall') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusOrScanError', 'cancellation', 'verifyEmail', 'emailDeliveryFailed', 'deletion') NOT NULL`,
    );
  }
}
