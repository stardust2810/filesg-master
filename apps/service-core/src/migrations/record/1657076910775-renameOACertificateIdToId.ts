import {MigrationInterface, QueryRunner} from "typeorm";

export class renameOACertificateIdToId1657076910775 implements MigrationInterface {
    name = 'renameOACertificateIdToId1657076910775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_2b361ac98db94470f96141fe581\``);
        await queryRunner.query(`ALTER TABLE \`oa_certificate\` CHANGE \`oaCertificateId\` \`id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`oaCertificateOaCertificateId\` \`oaCertificateId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_1b42b2a511574b9434809aeef1b\` FOREIGN KEY (\`oaCertificateId\`) REFERENCES \`oa_certificate\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_1b42b2a511574b9434809aeef1b\``);
        await queryRunner.query(`ALTER TABLE \`file_asset\` CHANGE \`oaCertificateId\` \`oaCertificateOaCertificateId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`oa_certificate\` CHANGE \`id\` \`oaCertificateId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_2b361ac98db94470f96141fe581\` FOREIGN KEY (\`oaCertificateOaCertificateId\`) REFERENCES \`oa_certificate\`(\`oaCertificateId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
