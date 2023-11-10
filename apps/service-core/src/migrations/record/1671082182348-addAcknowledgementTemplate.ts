import { MigrationInterface, QueryRunner } from "typeorm";

export class addAcknowledgementTemplate1671082182348 implements MigrationInterface {
    name = 'addAcknowledgementTemplate1671082182348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`acknowledgement_template\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`templateContent\` json NOT NULL, \`eserviceId\` int NOT NULL, UNIQUE INDEX \`IDX_36ff8ea08b822c771f56cd3e7c\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`isAcknowledgementRequired\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`acknowledgedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`acknowledgementTemplateId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`acknowledgement_template\` ADD CONSTRAINT \`FK_b65682c0643f2c737f85e636aca\` FOREIGN KEY (\`eserviceId\`) REFERENCES \`eservice\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_f5127ef7d9bff2352ad36f5923c\` FOREIGN KEY (\`acknowledgementTemplateId\`) REFERENCES \`acknowledgement_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_f5127ef7d9bff2352ad36f5923c\``);
        await queryRunner.query(`ALTER TABLE \`acknowledgement_template\` DROP FOREIGN KEY \`FK_b65682c0643f2c737f85e636aca\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`acknowledgementTemplateId\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`acknowledgedAt\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`isAcknowledgementRequired\``);
        await queryRunner.query(`DROP INDEX \`IDX_36ff8ea08b822c771f56cd3e7c\` ON \`acknowledgement_template\``);
        await queryRunner.query(`DROP TABLE \`acknowledgement_template\``);
    }

}
