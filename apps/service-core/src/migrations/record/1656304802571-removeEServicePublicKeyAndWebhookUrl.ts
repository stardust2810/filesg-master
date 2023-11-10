import {MigrationInterface, QueryRunner} from "typeorm";

export class removeEServicePublicKeyAndWebhookUrl1656304802571 implements MigrationInterface {
    name = 'removeEServicePublicKeyAndWebhookUrl1656304802571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice\` DROP COLUMN \`publicKey\``);
        await queryRunner.query(`ALTER TABLE \`eservice\` DROP COLUMN \`webhookUrl\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`eservice\` ADD \`webhookUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`eservice\` ADD \`publicKey\` varchar(255) NULL`);
    }

}
