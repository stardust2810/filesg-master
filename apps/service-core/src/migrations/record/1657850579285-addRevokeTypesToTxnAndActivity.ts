import {MigrationInterface, QueryRunner} from "typeorm";

export class addRevokeTypesToTxnAndActivity1657850579285 implements MigrationInterface {
    name = 'addRevokeTypesToTxnAndActivity1657850579285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('upload', 'share', 'transfer', 'upload_share', 'upload_transfer', 'widget', 'revoke') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`type\` \`type\` enum ('upload', 'send_share', 'receive_share', 'send_transfer', 'receive_transfer', 'send_file_request', 'receive_file_request', 'send_file_send_file_request', 'receive_file_receive_file_request', 'send_revoke', 'receive_revoke') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`type\` \`type\` enum ('upload', 'send_share', 'receive_share', 'send_transfer', 'receive_transfer', 'send_file_request', 'receive_file_request', 'send_file_send_file_request', 'receive_file_receive_file_request') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`type\` \`type\` enum ('upload', 'share', 'transfer', 'upload_share', 'upload_transfer', 'widget') NOT NULL`);
    }

}
