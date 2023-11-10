import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTemplatesRelationshipToAgencies1688832239919 implements MigrationInterface {
  name = 'updateTemplatesRelationshipToAgencies1688832239919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP FOREIGN KEY \`FK_b3027617f6571299567061dd775\``);
    await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP FOREIGN KEY \`FK_904ad4826b46cd89528addc7dde\``);
    await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`applicationTypeId\` \`agencyId\` int NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP COLUMN \`applicationTypeNotificationId\``);
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` ADD \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY') NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` ADD \`agencyId\` int NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` ADD CONSTRAINT \`FK_80a275a42679666e52eeb0c03d0\` FOREIGN KEY (\`agencyId\`) REFERENCES \`agency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` ADD CONSTRAINT \`FK_b8d045e25e557caffcf36011c65\` FOREIGN KEY (\`agencyId\`) REFERENCES \`agency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` DROP FOREIGN KEY \`FK_b8d045e25e557caffcf36011c65\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP FOREIGN KEY \`FK_80a275a42679666e52eeb0c03d0\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP COLUMN \`agencyId\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` DROP COLUMN \`notificationChannel\``);
    await queryRunner.query(`ALTER TABLE \`notification_message_template\` ADD \`applicationTypeNotificationId\` int NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`transaction_custom_message_template\` CHANGE \`agencyId\` \`applicationTypeId\` int NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`transaction_custom_message_template\` ADD CONSTRAINT \`FK_904ad4826b46cd89528addc7dde\` FOREIGN KEY (\`applicationTypeId\`) REFERENCES \`application_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_template\` ADD CONSTRAINT \`FK_b3027617f6571299567061dd775\` FOREIGN KEY (\`applicationTypeNotificationId\`) REFERENCES \`application_type_notification\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
