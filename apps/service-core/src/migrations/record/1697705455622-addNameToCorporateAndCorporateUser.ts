import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToCorporateAndCorporateUser1697705455622 implements MigrationInterface {
    name = 'AddNameToCorporateAndCorporateUser1697705455622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`corporate\` ADD \`name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` ADD \`name\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`corporate_user\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`corporate\` DROP COLUMN \`name\``);
    }

}
