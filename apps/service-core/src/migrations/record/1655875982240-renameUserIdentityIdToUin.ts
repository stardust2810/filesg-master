import {MigrationInterface, QueryRunner} from "typeorm";

export class renameUserIdentityIdToUin1655875982240 implements MigrationInterface {
    name = 'renameUserIdentityIdToUin1655875982240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`identityId\` \`uin\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`uin\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`uin\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`uin\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`uin\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`uin\` \`identityId\` varchar(255) NULL`);
    }

}
