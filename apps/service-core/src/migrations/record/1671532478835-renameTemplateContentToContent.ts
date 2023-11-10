import { MigrationInterface, QueryRunner } from "typeorm";

export class renameTemplateContentToContent1671532478835 implements MigrationInterface {
    name = 'renameTemplateContentToContent1671532478835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`acknowledgement_template\` CHANGE \`templateContent\` \`content\` json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`acknowledgement_template\` CHANGE \`content\` \`templateContent\` json NOT NULL`);
    }

}
