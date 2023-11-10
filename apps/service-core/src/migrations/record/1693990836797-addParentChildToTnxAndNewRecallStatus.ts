import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentChildToTnxAndNewRecallStatus1693990836797 implements MigrationInterface {
  name = 'AddParentChildToTnxAndNewRecallStatus1693990836797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`parentId\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('upload', 'share', 'transfer', 'upload_share', 'upload_transfer', 'widget', 'revoke', 'expire', 'delete', 'recall') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`status\` \`status\` enum ('init', 'draft', 'uploaded', 'failed', 'completed', 'recalled') NOT NULL DEFAULT 'init'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION', 'RECALL') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION', 'RECALL') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'completed', 'sent', 'recalled') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity\` CHANGE \`type\` \`type\` enum ('upload', 'send_share', 'receive_share', 'send_transfer', 'receive_transfer', 'send_file_request', 'receive_file_request', 'send_file_send_file_request', 'receive_file_receive_file_request', 'send_revoke', 'receive_revoke', 'trigger_expire', 'receive_expire', 'trigger_delete', 'receive_delete', 'send_recall', 'receive_recall') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_a771805b36e2f1b39131205abdf\` FOREIGN KEY (\`parentId\`) REFERENCES \`transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_a771805b36e2f1b39131205abdf\``);
    await queryRunner.query(
      `ALTER TABLE \`activity\` CHANGE \`type\` \`type\` enum ('upload', 'send_share', 'receive_share', 'send_transfer', 'receive_transfer', 'send_file_request', 'receive_file_request', 'send_file_send_file_request', 'receive_file_receive_file_request', 'send_revoke', 'receive_revoke', 'trigger_expire', 'receive_expire', 'trigger_delete', 'receive_delete') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'completed', 'sent') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` CHANGE \`type\` \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`status\` \`status\` enum ('init', 'draft', 'uploaded', 'failed', 'completed') NOT NULL DEFAULT 'init'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('upload', 'share', 'transfer', 'upload_share', 'upload_transfer', 'widget', 'revoke', 'expire', 'delete') NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`parentId\``);
  }
}
