import {MigrationInterface, QueryRunner} from "typeorm";

export class updateActivityWithNonSingpassAuth1655103829268 implements MigrationInterface {
    name = 'updateActivityWithNonSingpassAuth1655103829268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`nonSingpassAuth\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`application\` CHANGE \`externalRefId\` \`externalRefId\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`application\` CHANGE \`externalRefId\` \`externalRefId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`nonSingpassAuth\``);
    }

}
