import {MigrationInterface, QueryRunner} from "typeorm";

export class madeUserUinUnique1657248362673 implements MigrationInterface {
    name = 'madeUserUinUnique1657248362673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_40048bd80a171e4c25f67dcd43\` (\`uin\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_40048bd80a171e4c25f67dcd43\``);
    }

}
