import {MigrationInterface, QueryRunner} from "typeorm";

export class renameTransactionCustomEserviceMsg1656568071188 implements MigrationInterface {
    name = 'renameTransactionCustomEserviceMsg1656568071188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`customEserviceMessage\` \`customAgencyMessage\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`customAgencyMessage\` \`customEserviceMessage\` text NULL`);
    }

}
