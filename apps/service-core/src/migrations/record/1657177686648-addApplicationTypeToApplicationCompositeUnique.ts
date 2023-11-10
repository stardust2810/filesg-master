import {MigrationInterface, QueryRunner} from "typeorm";

export class addApplicationTypeToApplicationCompositeUnique1657177686648 implements MigrationInterface {
    name = 'addApplicationTypeToApplicationCompositeUnique1657177686648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`externalRefId_eservice\` ON \`application\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`externalRefId_eservice_applicationType\` ON \`application\` (\`externalRefId\`, \`eserviceId\`, \`applicationTypeId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`externalRefId_eservice_applicationType\` ON \`application\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`externalRefId_eservice\` ON \`application\` (\`externalRefId\`, \`eserviceId\`)`);
    }

}
