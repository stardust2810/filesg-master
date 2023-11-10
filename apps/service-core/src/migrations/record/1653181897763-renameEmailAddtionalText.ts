import {MigrationInterface, QueryRunner} from "typeorm";

export class renameEmailAddtionalText1653181897763 implements MigrationInterface {
    name = 'renameEmailAddtionalText1653181897763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`emailAdditionalText\` \`customEserviceMessage\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`customEserviceMessage\` \`emailAdditionalText\` text NULL`);
    }

}
