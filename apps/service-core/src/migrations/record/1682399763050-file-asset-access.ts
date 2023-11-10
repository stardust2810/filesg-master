import { MigrationInterface, QueryRunner } from "typeorm";

export class fileAssetAccess1682399763050 implements MigrationInterface {
    name = 'fileAssetAccess1682399763050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`file_asset_access\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`fileAssetId\` int NULL, UNIQUE INDEX \`IDX_bb0f367f79e6d226c2cd0ec1f5\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` ADD CONSTRAINT \`FK_6e4543e9a52bbc6b5b248a934ac\` FOREIGN KEY (\`fileAssetId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file_asset_access\` DROP FOREIGN KEY \`FK_6e4543e9a52bbc6b5b248a934ac\``);
        await queryRunner.query(`DROP INDEX \`IDX_bb0f367f79e6d226c2cd0ec1f5\` ON \`file_asset_access\``);
        await queryRunner.query(`DROP TABLE \`file_asset_access\``);
    }

}
