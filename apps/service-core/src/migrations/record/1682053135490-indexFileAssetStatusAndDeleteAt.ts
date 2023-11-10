import { MigrationInterface, QueryRunner } from "typeorm";

export class indexFileAssetStatusAndDeleteAt1682053135490 implements MigrationInterface {
    name = 'indexFileAssetStatusAndDeleteAt1682053135490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_303efa6ccb82d07160d6daec0a\` ON \`file_asset\` (\`status\`, \`deleteAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_303efa6ccb82d07160d6daec0a\` ON \`file_asset\``);
    }

}
