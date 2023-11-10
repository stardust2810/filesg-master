import { MigrationInterface, QueryRunner } from "typeorm";

export class addAcknowledgementTemplateName1671528128333 implements MigrationInterface {
    name = 'addAcknowledgementTemplateName1671528128333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`acknowledgement_template\` ADD \`name\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`acknowledgement_template\` DROP COLUMN \`name\``);
    }

}
