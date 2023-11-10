import {MigrationInterface, QueryRunner} from "typeorm";

export class email1651117394943 implements MigrationInterface {
    name = 'email1651117394943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`email\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`type\` enum ('issuance', 'resetPassword', 'virusFround') NOT NULL, \`emailId\` varchar(255) NOT NULL, \`emailHeader\` varchar(255) NOT NULL, \`emailContent\` mediumtext NOT NULL, \`eventType\` varchar(255) NULL, \`subEventType\` varchar(255) NULL, \`activityId\` int NOT NULL, UNIQUE INDEX \`IDX_a6db4f191b9a83ca3c8f4149d1\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`email_black_list\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`emailAddress\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_c28b3842e97d0cb33578701af4\` (\`emailAddress\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`dob\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('delete', 'move', 'upload', 'share', 'rename', 'download') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` ADD CONSTRAINT \`FK_52c77ab85cc7f75e5505b01f1b7\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` DROP FOREIGN KEY \`FK_52c77ab85cc7f75e5505b01f1b7\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('delete', 'move', 'upload', 'share', 'rename') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`dob\``);
        await queryRunner.query(`DROP INDEX \`IDX_c28b3842e97d0cb33578701af4\` ON \`email_black_list\``);
        await queryRunner.query(`DROP TABLE \`email_black_list\``);
        await queryRunner.query(`DROP INDEX \`IDX_a6db4f191b9a83ca3c8f4149d1\` ON \`email\``);
        await queryRunner.query(`DROP TABLE \`email\``);
    }

}
