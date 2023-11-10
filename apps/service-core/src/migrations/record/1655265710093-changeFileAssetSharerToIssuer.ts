import {MigrationInterface, QueryRunner} from "typeorm";

export class changeFileAssetSharerToIssuer1655265710093 implements MigrationInterface {
    name = 'changeFileAssetSharerToIssuer1655265710093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_191fe0980782e30df1c0e0a2676\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`sharerId\` \`issuerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_083e1fddd77688289c950ab70fd\` FOREIGN KEY (\`issuerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_083e1fddd77688289c950ab70fd\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`issuerId\` \`sharerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_191fe0980782e30df1c0e0a2676\` FOREIGN KEY (\`sharerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
