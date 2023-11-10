import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkCorporateToCorporateUser1698203089975 implements MigrationInterface {
    name = 'LinkCorporateToCorporateUser1698203089975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`composite\` ON \`corporate_user\``);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` CHANGE \`uen\` \`corporateId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` DROP COLUMN \`corporateId\``);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` ADD \`corporateId\` int NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`composite\` ON \`corporate_user\` (\`uin\`, \`corporateId\`)`);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` ADD CONSTRAINT \`FK_0a8248d735be9860b263b97f61c\` FOREIGN KEY (\`corporateId\`) REFERENCES \`corporate\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`corporate_user\` DROP FOREIGN KEY \`FK_0a8248d735be9860b263b97f61c\``);
        await queryRunner.query(`DROP INDEX \`composite\` ON \`corporate_user\``);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` DROP COLUMN \`corporateId\``);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` ADD \`corporateId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` CHANGE \`corporateId\` \`uen\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`composite\` ON \`corporate_user\` (\`uin\`, \`uen\`)`);
    }

}
