import { MigrationInterface, QueryRunner } from 'typeorm';

export class eserviceColUpdate1683815239637 implements MigrationInterface {
  name = 'eserviceColUpdate1683815239637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a new col called emails
    await queryRunner.query(`ALTER TABLE eservice ADD emails text NOT NULL;`);

    // Migrate the data
    await queryRunner.query(`UPDATE eservice SET emails = email;`);

    // Delete old email col
    await queryRunner.query(`ALTER TABLE eservice DROP COLUMN email;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create a new col called email
    await queryRunner.query(`ALTER TABLE eservice ADD email varchar(255) NOT NULL;`);

    // Migrate the data
    await queryRunner.query(`UPDATE eservice SET email = emails;`);

    // Delete old emails col
    await queryRunner.query(`ALTER TABLE eservice DROP COLUMN emails;`);
  }
}
