import { MigrationInterface, QueryRunner } from "typeorm";

export class addHashToOACertificate1667527620460 implements MigrationInterface {
    name = 'addHashToOACertificate1667527620460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`oa_certificate\` ADD \`hash\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusOrScanError', 'cancellation', 'verifyEmail', 'emailDeliveryFailed') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusFound', 'cancellation') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`oa_certificate\` DROP COLUMN \`hash\``);
    }

}
