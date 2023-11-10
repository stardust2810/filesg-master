import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUserIssuerIdToNonNullable1658735224955 implements MigrationInterface {
    name = 'updateUserIssuerIdToNonNullable1658735224955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_083e1fddd77688289c950ab70fd\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`issuerId\` \`issuerId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_083e1fddd77688289c950ab70fd\` FOREIGN KEY (\`issuerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_083e1fddd77688289c950ab70fd\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`issuerId\` \`issuerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_083e1fddd77688289c950ab70fd\` FOREIGN KEY (\`issuerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
