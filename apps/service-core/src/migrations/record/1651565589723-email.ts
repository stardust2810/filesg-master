import { MigrationInterface, QueryRunner } from 'typeorm';

export class email1651565589723 implements MigrationInterface {
  name = 'email1651565589723';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_a6db4f191b9a83ca3c8f4149d1\` ON \`email\``);
    await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`uuid\` \`awsMessageId\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`email\` DROP COLUMN \`awsMessageId\``);
    await queryRunner.query(`ALTER TABLE \`email\` ADD \`awsMessageId\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`email\` ADD UNIQUE INDEX \`IDX_21f251af1fe7440fcaf402c426\` (\`awsMessageId\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`email\` DROP INDEX \`IDX_21f251af1fe7440fcaf402c426\``);
    await queryRunner.query(`ALTER TABLE \`email\` DROP COLUMN \`awsMessageId\``);
    await queryRunner.query(`ALTER TABLE \`email\` ADD \`awsMessageId\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`email\` CHANGE \`awsMessageId\` \`uuid\` varchar(255) NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_a6db4f191b9a83ca3c8f4149d1\` ON \`email\` (\`uuid\`)`);
  }
}
