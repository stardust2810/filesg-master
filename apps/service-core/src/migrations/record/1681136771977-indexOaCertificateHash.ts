import { MigrationInterface, QueryRunner } from "typeorm";

export class indexOaCertificateHash1681136771977 implements MigrationInterface {
    name = 'indexOaCertificateHash1681136771977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_ec71c9f850018e283662b397d7\` ON \`oa_certificate\` (\`hash\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_ec71c9f850018e283662b397d7\` ON \`oa_certificate\``);
    }

}
