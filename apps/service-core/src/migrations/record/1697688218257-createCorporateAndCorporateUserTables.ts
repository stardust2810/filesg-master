import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCorporateAndCorporateUserTables1697688218257 implements MigrationInterface {
    name = 'CreateCorporateAndCorporateUserTables1697688218257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`corporate\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uen\` varchar(255) NOT NULL, \`userId\` int NULL, UNIQUE INDEX \`IDX_d114fb31e87d7e635f8a56963a\` (\`uen\`), UNIQUE INDEX \`REL_fe303c534acc3c135cd2cc8f15\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`corporate_user\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uin\` varchar(255) NOT NULL, \`uen\` varchar(255) NOT NULL, \`lastLoginAt\` datetime NULL, \`userId\` int NULL, UNIQUE INDEX \`composite\` (\`uin\`, \`uen\`), UNIQUE INDEX \`REL_6ed8e0a28c4c38ad9ab8a8ef69\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusOrScanError', 'cancellation', 'verifyEmail', 'emailDeliveryFailed', 'deletion', 'recall', 'formSg') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'programmatic', 'eservice', 'corporate', 'corporate-user') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'SYSTEM', 'CITIZEN', 'CORPORATE', 'CORPORATE_USER', 'PROGRAMMATIC_SYSTEM_INTEGRATION', 'FORMSG') NOT NULL DEFAULT 'CITIZEN'`);
        await queryRunner.query(`ALTER TABLE \`corporate\` ADD CONSTRAINT \`FK_fe303c534acc3c135cd2cc8f15b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corporate_user\` ADD CONSTRAINT \`FK_6ed8e0a28c4c38ad9ab8a8ef692\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`corporate_user\` DROP FOREIGN KEY \`FK_6ed8e0a28c4c38ad9ab8a8ef692\``);
        await queryRunner.query(`ALTER TABLE \`corporate\` DROP FOREIGN KEY \`FK_fe303c534acc3c135cd2cc8f15b\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role\` \`role\` enum ('PROGRAMMATIC_WRITE', 'PROGRAMMATIC_READ', 'SYSTEM', 'CITIZEN', 'PROGRAMMATIC_SYSTEM_INTEGRATION', 'FORMSG') NOT NULL DEFAULT 'CITIZEN'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'programmatic', 'eservice') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusOrScanError', 'cancellation', 'verifyEmail', 'emailDeliveryFailed', 'deletion', 'recall') NOT NULL`);
        await queryRunner.query(`DROP INDEX \`REL_6ed8e0a28c4c38ad9ab8a8ef69\` ON \`corporate_user\``);
        await queryRunner.query(`DROP INDEX \`composite\` ON \`corporate_user\``);
        await queryRunner.query(`DROP TABLE \`corporate_user\``);
        await queryRunner.query(`DROP INDEX \`REL_fe303c534acc3c135cd2cc8f15\` ON \`corporate\``);
        await queryRunner.query(`DROP INDEX \`IDX_d114fb31e87d7e635f8a56963a\` ON \`corporate\``);
        await queryRunner.query(`DROP TABLE \`corporate\``);
    }

}
