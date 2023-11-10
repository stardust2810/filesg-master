import {MigrationInterface, QueryRunner} from "typeorm";

export class addApplicationType1656920099169 implements MigrationInterface {
    name = 'addApplicationType1656920099169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`application_type\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_b53229d75c2fe5a617ecbff82f\` (\`uuid\`), UNIQUE INDEX \`IDX_4dc086c7d5868bd0eeee0fd719\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`eservice_application_type\` (\`eserviceId\` int NOT NULL, \`applicationTypeId\` int NOT NULL, INDEX \`IDX_9ce60376a772af9ec4295abf51\` (\`eserviceId\`), INDEX \`IDX_31c3e1924ad0f4117286f8f9da\` (\`applicationTypeId\`), PRIMARY KEY (\`eserviceId\`, \`applicationTypeId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`application\` ADD \`applicationTypeId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`application\` ADD CONSTRAINT \`FK_05797cf0cbb98c1b7c5fefc5390\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`eservice_application_type\` ADD CONSTRAINT \`FK_9ce60376a772af9ec4295abf515\` FOREIGN KEY (\`eserviceId\`) REFERENCES \`eservice\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`eservice_application_type\` ADD CONSTRAINT \`FK_31c3e1924ad0f4117286f8f9da2\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice_application_type\` DROP FOREIGN KEY \`FK_31c3e1924ad0f4117286f8f9da2\``);
        await queryRunner.query(`ALTER TABLE \`eservice_application_type\` DROP FOREIGN KEY \`FK_9ce60376a772af9ec4295abf515\``);
        await queryRunner.query(`ALTER TABLE \`application\` DROP FOREIGN KEY \`FK_05797cf0cbb98c1b7c5fefc5390\``);
        await queryRunner.query(`ALTER TABLE \`application\` DROP COLUMN \`applicationTypeId\``);
        await queryRunner.query(`DROP INDEX \`IDX_31c3e1924ad0f4117286f8f9da\` ON \`eservice_application_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_9ce60376a772af9ec4295abf51\` ON \`eservice_application_type\``);
        await queryRunner.query(`DROP TABLE \`eservice_application_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_4dc086c7d5868bd0eeee0fd719\` ON \`application_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_b53229d75c2fe5a617ecbff82f\` ON \`application_type\``);
        await queryRunner.query(`DROP TABLE \`application_type\``);
    }

}
