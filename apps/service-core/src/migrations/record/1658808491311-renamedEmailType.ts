import {MigrationInterface, QueryRunner} from "typeorm";

export class renamedEmailType1658808491311 implements MigrationInterface {
    name = 'renamedEmailType1658808491311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusFound', 'cancellation') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`type\` \`type\` enum ('issuance', 'resetPassword', 'virusFround', 'cancellation') NOT NULL`);
    }

}
