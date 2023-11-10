import { MigrationInterface, QueryRunner } from "typeorm";

export class addPostScanErrorToQueueEventEnum1687853675379 implements MigrationInterface {
    name = 'addPostScanErrorToQueueEventEnum1687853675379'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`failCategory\` \`failCategory\` enum ('virus', 'scanError', 'postScanError', 'uploadToStaging', 'uploadMove', 'transferMove', 'deletion') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`failCategory\` \`failCategory\` enum ('virus', 'scanError', 'uploadToStaging', 'uploadMove', 'transferMove', 'deletion') NULL`);
    }

}
