import {MigrationInterface, QueryRunner} from "typeorm";

export class renameActivityNonSingpassAuthColumn1655787567698 implements MigrationInterface {
    name = 'renameActivityNonSingpassAuthColumn1655787567698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`nonSingpassAuth\` \`recipientInfo\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity\` CHANGE \`recipientInfo\` \`nonSingpassAuth\` json NULL`);
    }

}
