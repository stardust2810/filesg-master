import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameClientUserToProgrammaticUser1656670694455 implements MigrationInterface {
  name = 'renameClientUserToProgrammaticUser1656670694455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`client\` DROP FOREIGN KEY \`FK_31edca1e59f9b535db01634283a\``);
    await queryRunner.query(`ALTER TABLE \`client\` CHANGE \`clientUserId\` \`programmaticUserId\` int NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'client', 'programmatic') NOT NULL`);
    await queryRunner.query("UPDATE user SET `type` = 'programmatic' WHERE `type` = 'client'");
    await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'programmatic') NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`client\` ADD CONSTRAINT \`FK_8a9e4b70b534eea4d2dd879bd90\` FOREIGN KEY (\`programmaticUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`client\` DROP FOREIGN KEY \`FK_8a9e4b70b534eea4d2dd879bd90\``);
    await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'client', 'programmatic') NOT NULL`);
    await queryRunner.query("UPDATE user SET `type` = 'client' WHERE `type` = 'programmatic'");
    await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`type\` \`type\` enum ('agency', 'citizen', 'client') NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`client\` CHANGE \`programmaticUserId\` \`clientUserId\` int NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`client\` ADD CONSTRAINT \`FK_31edca1e59f9b535db01634283a\` FOREIGN KEY (\`clientUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
