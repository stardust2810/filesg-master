import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCompositeUniqueIndexForTemplates1691456846117 implements MigrationInterface {
    name = 'AddedCompositeUniqueIndexForTemplates1691456846117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`composite\` ON \`notification_message_template\` (\`agencyId\`, \`name\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`composite\` ON \`transaction_custom_message_template\` (\`agencyId\`, \`name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`composite\` ON \`transaction_custom_message_template\``);
        await queryRunner.query(`DROP INDEX \`composite\` ON \`notification_message_template\``);
    }

}
