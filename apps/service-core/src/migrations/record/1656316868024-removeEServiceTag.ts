import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeEServiceTag1656316868024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`eservice_tag\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`eservice_tag\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`eserviceId\` int NOT NULL, UNIQUE INDEX \`IDX_fd99e0104b9aafe4da7b77943f\` (\`uuid\`), UNIQUE INDEX \`composite\` (\`eserviceId\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`eservice_tag\` ADD CONSTRAINT \`FK_479b63f596f4374530a2ecca2a9\` FOREIGN KEY (\`eserviceId\`) REFERENCES \`eservice\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
