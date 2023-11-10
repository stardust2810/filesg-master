import {MigrationInterface, QueryRunner} from "typeorm";

export class removeRevokedStatusForActivityAndTxn1658114467601 implements MigrationInterface {
    name = 'removeRevokedStatusForActivityAndTxn1658114467601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusFround', 'cancellation') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`status\` \`status\` enum ('init', 'draft', 'uploaded', 'failed', 'completed') NOT NULL DEFAULT 'init'`);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'completed', 'sent') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'completed', 'revoked', 'sent') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`status\` \`status\` enum ('init', 'draft', 'uploaded', 'failed', 'completed', 'revoked') NOT NULL DEFAULT 'init'`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusFround') NOT NULL`);
    }

}
