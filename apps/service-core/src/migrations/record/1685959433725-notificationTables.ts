import { MigrationInterface, QueryRunner } from "typeorm";

export class notificationTables1685959433725 implements MigrationInterface {
    name = 'notificationTables1685959433725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`notification_message_input\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY', '0', '1') NOT NULL, \`templateInput\` json NULL, \`templateVersion\` int NOT NULL, \`messageTemplateId\` int NULL, \`transactionId\` int NULL, UNIQUE INDEX \`IDX_c3e6dec2a874b8c2c82c053773\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification_message_template_audit\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`template\` text NOT NULL, \`version\` int NOT NULL, \`requiredFields\` text NULL, \`externalTemplateId\` varchar(255) NOT NULL, \`notificationMessageTemplateId\` int NULL, UNIQUE INDEX \`IDX_25e432d0fa73465261facddcd3\` (\`externalTemplateId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification_message_template\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`template\` text NOT NULL, \`version\` int NOT NULL, \`requiredFields\` text NULL, \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION', 'REVOCATION', '0', '1', '2', '3') NOT NULL, \`externalTemplateId\` varchar(255) NOT NULL, \`applicationTypeNotificationId\` int NULL, UNIQUE INDEX \`IDX_b24257d6295a90a69cac3a2f71\` (\`uuid\`), UNIQUE INDEX \`IDX_071d21f1a1992ebd6278f26161\` (\`externalTemplateId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`application_type_notification\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY', '0', '1') NOT NULL, \`applicationTypeId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transaction_custom_message_template\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`template\` text NOT NULL, \`requiredFields\` text NULL, \`type\` enum ('ISSUANCE', 'CANCELLATION', 'DELETION', 'REVOCATION', '0', '1', '2', '3') NOT NULL, \`applicationTypeId\` int NULL, UNIQUE INDEX \`IDX_608c88623947def075c4f3e55d\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification_history\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY', '0', '1') NOT NULL, \`status\` varchar(255) NOT NULL, \`statusDetails\` text NULL, \`activityId\` int NOT NULL, UNIQUE INDEX \`IDX_6534d39d7ee3c8c0753d4bc8c5\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`customMessage\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_6eaebf565536b652c5be59e15ef\` FOREIGN KEY (\`messageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_3ffda4dbb7392c63f01847dbc78\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` ADD CONSTRAINT \`FK_72bf78d69d80a62d97edbf10fff\` FOREIGN KEY (\`notificationMessageTemplateId\`) REFERENCES \`notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` ADD CONSTRAINT \`FK_b3027617f6571299567061dd775\` FOREIGN KEY (\`applicationTypeNotificationId\`) REFERENCES \`application_type_notification\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`application_type_notification\` ADD CONSTRAINT \`FK_f28fcdc0ccbc87ad33375cd1e5a\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` ADD CONSTRAINT \`FK_904ad4826b46cd89528addc7dde\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_history\` ADD CONSTRAINT \`FK_baa996271d9a006138de61d1dae\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_history\` DROP FOREIGN KEY \`FK_baa996271d9a006138de61d1dae\``);
        await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP FOREIGN KEY \`FK_904ad4826b46cd89528addc7dde\``);
        await queryRunner.query(`ALTER TABLE \`application_type_notification\` DROP FOREIGN KEY \`FK_f28fcdc0ccbc87ad33375cd1e5a\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP FOREIGN KEY \`FK_b3027617f6571299567061dd775\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_template_audit\` DROP FOREIGN KEY \`FK_72bf78d69d80a62d97edbf10fff\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_3ffda4dbb7392c63f01847dbc78\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_6eaebf565536b652c5be59e15ef\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`customMessage\``);
        await queryRunner.query(`DROP INDEX \`IDX_6534d39d7ee3c8c0753d4bc8c5\` ON \`notification_history\``);
        await queryRunner.query(`DROP TABLE \`notification_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_608c88623947def075c4f3e55d\` ON \`transaction_custom_message_template\``);
        await queryRunner.query(`DROP TABLE \`transaction_custom_message_template\``);
        await queryRunner.query(`DROP TABLE \`application_type_notification\``);
        await queryRunner.query(`DROP INDEX \`IDX_071d21f1a1992ebd6278f26161\` ON \`notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_b24257d6295a90a69cac3a2f71\` ON \`notification_message_template\``);
        await queryRunner.query(`DROP TABLE \`notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_25e432d0fa73465261facddcd3\` ON \`notification_message_template_audit\``);
        await queryRunner.query(`DROP TABLE \`notification_message_template_audit\``);
        await queryRunner.query(`DROP INDEX \`IDX_c3e6dec2a874b8c2c82c053773\` ON \`notification_message_input\``);
        await queryRunner.query(`DROP TABLE \`notification_message_input\``);
    }

}
