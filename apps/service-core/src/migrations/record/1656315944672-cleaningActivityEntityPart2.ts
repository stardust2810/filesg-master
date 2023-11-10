import {MigrationInterface, QueryRunner} from "typeorm";

export class cleaningActivityEntityPart21656315944672 implements MigrationInterface {
    name = 'cleaningActivityEntityPart21656315944672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'completed', 'revoked', 'sent') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`status\` \`status\` enum ('init', 'scanning', 'clean', 'failed', 'completed', 'seen', 'notSeen', 'revoked', 'sent') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD \`name\` varchar(255) NULL`);
    }

}
