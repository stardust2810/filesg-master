import {MigrationInterface, QueryRunner} from "typeorm";

export class removeFileAssetSymlink1656660228671 implements MigrationInterface {
    name = 'removeFileAssetSymlink1656660228671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_a2b574790ae615d32676f214ca7\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`symlinkId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`symlinkId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_a2b574790ae615d32676f214ca7\` FOREIGN KEY (\`symlinkId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
