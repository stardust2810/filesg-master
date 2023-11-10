import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEserviceWhitelistedUserToTransaction1693464335228 implements MigrationInterface {
    name = 'AddEserviceWhitelistedUserToTransaction1693464335228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`eserviceWhitelistedUserId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_7da15e131b84f3ab9c97c75abe0\` FOREIGN KEY (\`eserviceWhitelistedUserId\`) REFERENCES \`eservice_whitelisted_user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_7da15e131b84f3ab9c97c75abe0\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`eserviceWhitelistedUserId\``);
    }

}
