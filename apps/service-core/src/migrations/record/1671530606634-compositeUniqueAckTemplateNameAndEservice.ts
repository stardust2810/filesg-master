import { MigrationInterface, QueryRunner } from "typeorm";

export class compositeUniqueAckTemplateNameAndEservice1671530606634 implements MigrationInterface {
    name = 'compositeUniqueAckTemplateNameAndEservice1671530606634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`composite\` ON \`acknowledgement_template\` (\`eserviceId\`, \`name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`composite\` ON \`acknowledgement_template\``);
    }

}
