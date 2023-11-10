import {MigrationInterface, QueryRunner} from "typeorm";

export class cleaningActivityEntity1656307424263 implements MigrationInterface {
    name = 'cleaningActivityEntity1656307424263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_10a94c6f5da08d97991edce0b2\` ON \`activity\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`containerId\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`pin\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`requestRequirements\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`requestRequirements\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`pin\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`containerId\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_10a94c6f5da08d97991edce0b2\` ON \`activity\` (\`containerId\`, \`transactionId\`, \`type\`, \`userId\`)`);
    }

}
