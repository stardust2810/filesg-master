import { MigrationInterface, QueryRunner } from "typeorm";

export class updatedManyToOneNullable1687750850648 implements MigrationInterface {
    name = 'updatedManyToOneNullable1687750850648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_3ffda4dbb7392c63f01847dbc78\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` CHANGE \`transactionId\` \`transactionId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` DROP FOREIGN KEY \`FK_6e4543e9a52bbc6b5b248a934ac\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` CHANGE \`fileAssetId\` \`fileAssetId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_3ffda4dbb7392c63f01847dbc78\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` ADD CONSTRAINT \`FK_6e4543e9a52bbc6b5b248a934ac\` FOREIGN KEY (\`fileAssetId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` DROP FOREIGN KEY \`FK_6e4543e9a52bbc6b5b248a934ac\``);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` DROP FOREIGN KEY \`FK_3ffda4dbb7392c63f01847dbc78\``);
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` CHANGE \`fileAssetId\` \`fileAssetId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` ADD CONSTRAINT \`FK_6e4543e9a52bbc6b5b248a934ac\` FOREIGN KEY (\`fileAssetId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` CHANGE \`transactionId\` \`transactionId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`notification_message_input\` ADD CONSTRAINT \`FK_3ffda4dbb7392c63f01847dbc78\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
