import {MigrationInterface, QueryRunner} from "typeorm";

export class emailHeaderContentRemoved1652090679099 implements MigrationInterface {
    name = 'emailHeaderContentRemoved1652090679099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` DROP COLUMN \`emailHeader\``);
        await queryRunner.query(`ALTER TABLE \`email\` DROP COLUMN \`emailContent\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` ADD \`emailContent\` mediumtext NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` ADD \`emailHeader\` varchar(255) NULL`);
    }

}
