import { MigrationInterface, QueryRunner } from 'typeorm';

export class renamedNotificationChannelAndStatusEnum1687236918150 implements MigrationInterface {
  name = 'renamedNotificationChannelAndStatusEnum1687236918150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY', 'SGNOTIFY') NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE \`notification_message_input\` SET \`notificationChannel\` = 'SG_NOTIFY' WHERE \`notificationChannel\` = 'SGNOTIFY'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY') NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`application_type_notification\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY', 'SGNOTIFY') NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE \`application_type_notification\` SET \`notificationChannel\` = 'SG_NOTIFY' WHERE \`notificationChannel\` = 'SGNOTIFY'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`application_type_notification\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY') NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`notification_history\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY', 'SGNOTIFY') NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE \`notification_history\` SET \`notificationChannel\` = 'SG_NOTIFY' WHERE \`notificationChannel\` = 'SGNOTIFY'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_history\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY') NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`notification_history\` CHANGE \`status\` \`status\` enum ('success', 'failed', '0', '1') NOT NULL`,
    );
    await queryRunner.query(`UPDATE \`notification_history\` SET \`status\` = 'success' WHERE \`status\` = '0'`);
    await queryRunner.query(`UPDATE \`notification_history\` SET \`status\` = 'failed' WHERE \`status\` = '1'`);
    await queryRunner.query(`ALTER TABLE \`notification_history\` CHANGE \`status\` \`status\` enum ('success', 'failed') NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification_history\` CHANGE \`status\` \`status\` enum ('SUCCESS', 'success', 'failed', 'FAILED', '0', '1') NOT NULL`,
    );
    await queryRunner.query(`UPDATE \`notification_history\` SET \`status\` = '0' WHERE \`status\` = 'success'`);
    await queryRunner.query(`UPDATE \`notification_history\` SET \`status\` = '1' WHERE \`status\` = 'failed'`);
    await queryRunner.query(
      `ALTER TABLE \`notification_history\` CHANGE \`status\` \`status\` enum ('SUCCESS', 'FAILED', '0', '1') NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`notification_history\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY', 'SGNOTIFY') NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE \`notification_history\` SET \`notificationChannel\` = 'SGNOTIFY' WHERE \`notificationChannel\` = 'SG_NOTIFY'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_history\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY') NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`application_type_notification\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY', 'SGNOTIFY') NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE \`application_type_notification\` SET \`notificationChannel\` = 'SGNOTIFY' WHERE \`notificationChannel\` = 'SG_NOTIFY'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`application_type_notification\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY') NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SG_NOTIFY', 'SGNOTIFY') NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE \`notification_message_input\` SET \`notificationChannel\` = 'SGNOTIFY' WHERE \`notificationChannel\` = 'SG_NOTIFY'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_message_input\` CHANGE \`notificationChannel\` \`notificationChannel\` enum ('EMAIL', 'SGNOTIFY') NOT NULL`,
    );
  }
}
