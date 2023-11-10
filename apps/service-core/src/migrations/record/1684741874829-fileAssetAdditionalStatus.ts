import { MigrationInterface, QueryRunner } from "typeorm";

export class fileAssetAdditionalStatus1684741874829 implements MigrationInterface {
    name = 'fileAssetAdditionalStatus1684741874829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_303efa6ccb82d07160d6daec0a\` ON \`file_asset\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'active', 'expired', 'pending', 'revoked', 'pending_delete', 'deleted') NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_303efa6ccb82d07160d6daec0a\` ON \`file_asset\` (\`status\`, \`deleteAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_303efa6ccb82d07160d6daec0a\` ON \`file_asset\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'active', 'expired', 'pending', 'revoked', 'deleted') NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_303efa6ccb82d07160d6daec0a\` ON \`file_asset\` (\`status\`, \`deleteAt\`)`);
    }

}
