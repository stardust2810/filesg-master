import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeProgrammaticUserClient1656906457844 implements MigrationInterface {
  name = 'removeProgrammaticUserClient1656906457844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`clientId\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_56f28841fe433cf13f8685f9bc\` (\`clientId\`)`);
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`clientSecret\` varchar(255) NULL`);

    // Data patch client.uuid and client.secret into clientId and clientSecret
    await queryRunner.query(`
        UPDATE \`user\` JOIN \`client\` ON user.id = client.programmaticUserId
        SET user.clientId = client.uuid, user.clientSecret = client.secret
        WHERE user.type = 'programmatic';
    `);

    await queryRunner.query(`DROP TABLE \`client\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`clientSecret\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_56f28841fe433cf13f8685f9bc\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`clientId\``);
    await queryRunner.query(
      `CREATE TABLE \`client\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`secret\` varchar(255) NOT NULL, \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL, \`type\` enum ('retrieval', 'update', 'full') NOT NULL, \`clientUserId\` int NOT NULL, UNIQUE INDEX \`IDX_1877f4f250c9271781a8eb70f9\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client\` ADD CONSTRAINT \`FK_31edca1e59f9b535db01634283a\` FOREIGN KEY (\`clientUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
