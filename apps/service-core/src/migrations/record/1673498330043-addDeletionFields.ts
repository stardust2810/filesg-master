import { MigrationInterface, QueryRunner } from "typeorm";

export class addDeleteionFields1673498330043 implements MigrationInterface {
    name = 'addDeleteionFields1673498330043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`deleteAt\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusOrScanError', 'cancellation', 'verifyEmail', 'emailDeliveryFailed', 'deletion') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('upload', 'share', 'transfer', 'upload_share', 'upload_transfer', 'widget', 'revoke', 'expire', 'delete') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'active', 'expired', 'pending', 'revoked', 'deleted') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`type\` \`type\` enum ('upload', 'send_share', 'receive_share', 'send_transfer', 'receive_transfer', 'send_file_request', 'receive_file_request', 'send_file_send_file_request', 'receive_file_receive_file_request', 'send_revoke', 'receive_revoke', 'trigger_expire', 'receive_expire', 'trigger_delete', 'receive_delete') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`type\` \`type\` enum ('upload', 'send_share', 'receive_share', 'send_transfer', 'receive_transfer', 'send_file_request', 'receive_file_request', 'send_file_send_file_request', 'receive_file_receive_file_request', 'send_revoke', 'receive_revoke', 'trigger_expire', 'receive_expire') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'active', 'expired', 'pending', 'revoked') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('upload', 'share', 'transfer', 'upload_share', 'upload_transfer', 'widget', 'revoke', 'expire') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusOrScanError', 'cancellation', 'verifyEmail', 'emailDeliveryFailed') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`deleteAt\``);
    }

}
