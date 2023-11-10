import {MigrationInterface, QueryRunner} from "typeorm";

export class emailCol1652086576587 implements MigrationInterface {
    name = 'emailCol1652086576587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`emailHeader\` \`emailHeader\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`emailContent\` \`emailContent\` mediumtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`emailContent\` \`emailContent\` mediumtext NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`emailHeader\` \`emailHeader\` varchar(255) NOT NULL`);
    }

}
