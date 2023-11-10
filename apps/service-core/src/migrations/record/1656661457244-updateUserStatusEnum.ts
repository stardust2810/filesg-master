import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUserStatusEnum1656661457244 implements MigrationInterface {
    name = 'updateUserStatusEnum1656661457244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`client\` CHANGE \`status\` \`status\` enum ('active', 'inactive') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`agency\` CHANGE \`status\` \`status\` enum ('active', 'inactive') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`status\` \`status\` enum ('active', 'inactive') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`status\` \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`agency\` CHANGE \`status\` \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`client\` CHANGE \`status\` \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL`);
    }

}
