import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOARevocationAndFileAsset1656405719753 implements MigrationInterface {
    name = 'updateOARevocationAndFileAsset1656405719753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`oa_certificate\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`oaCertificateId\` varchar(255) NOT NULL, \`status\` enum ('issued', 'revoked') NOT NULL, \`revocationType\` enum ('expired', 'cancelled', 'updated', 'recalled') NULL, \`reason\` varchar(255) NULL, \`revokedById\` int NULL, PRIMARY KEY (\`oaCertificateId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD \`actionById\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD \`actionToId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD \`oaCertificateOaCertificateId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('issued', 'revoked', 'upload', 'rename', 'share', 'unshare', 'delete', 'download') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'active', 'expired', 'pending', 'revoked') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD CONSTRAINT \`FK_2381c9dbc536e9cceec07914c8d\` FOREIGN KEY (\`actionById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD CONSTRAINT \`FK_caf9d64944102e2fbb7b0947b43\` FOREIGN KEY (\`actionToId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`oa_certificate\` ADD CONSTRAINT \`FK_1fb62bad69475e856724538ce73\` FOREIGN KEY (\`revokedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_2b361ac98db94470f96141fe581\` FOREIGN KEY (\`oaCertificateOaCertificateId\`) REFERENCES \`oa_certificate\`(\`oaCertificateId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_2b361ac98db94470f96141fe581\``);
        await queryRunner.query(`ALTER TABLE \`oa_certificate\` DROP FOREIGN KEY \`FK_1fb62bad69475e856724538ce73\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP FOREIGN KEY \`FK_caf9d64944102e2fbb7b0947b43\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP FOREIGN KEY \`FK_2381c9dbc536e9cceec07914c8d\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'active', 'expired', 'pending') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` CHANGE \`type\` \`type\` enum ('delete', 'move', 'upload', 'share', 'rename', 'created', 'download') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP COLUMN \`oaCertificateOaCertificateId\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP COLUMN \`actionToId\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP COLUMN \`actionById\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_history\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`oa_certificate\``);
    }

}
