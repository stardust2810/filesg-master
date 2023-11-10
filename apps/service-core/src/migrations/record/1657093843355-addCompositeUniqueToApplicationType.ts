import {MigrationInterface, QueryRunner} from "typeorm";

export class addCompositeUniqueToApplicationType1657093843355 implements MigrationInterface {
    name = 'addCompositeUniqueToApplicationType1657093843355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`externalRefId_eservice\` ON \`application\` (\`externalRefId\`, \`eserviceId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`externalRefId_eservice\` ON \`application\``);
    }

}
