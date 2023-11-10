import {MigrationInterface, QueryRunner} from "typeorm";

export class updateFileAssetMetadataToNullable1660611319955 implements MigrationInterface {
    name = 'updateFileAssetMetadataToNullable1660611319955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`metadata\` \`metadata\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`metadata\` \`metadata\` json NOT NULL`);
    }

}
