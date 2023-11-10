import { MigrationInterface, QueryRunner } from "typeorm";

export class compositeUniqueEserviceApplicationType1686016961409 implements MigrationInterface {
    name = 'compositeUniqueEserviceApplicationType1686016961409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_4dc086c7d5868bd0eeee0fd719\` ON \`application_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_c11f09867d33ab9bea127b7fa8\` ON \`application_type\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`composite\` ON \`application_type\` (\`eserviceId\`, \`code\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`composite\` ON \`application_type\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c11f09867d33ab9bea127b7fa8\` ON \`application_type\` (\`code\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_4dc086c7d5868bd0eeee0fd719\` ON \`application_type\` (\`name\`)`);
    }

}
