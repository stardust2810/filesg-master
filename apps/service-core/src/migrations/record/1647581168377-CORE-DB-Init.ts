import { MigrationInterface, QueryRunner } from 'typeorm';

export class COREDBInit1647581168377 implements MigrationInterface {
  name = 'COREDBInit1647581168377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`file_asset_history\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('delete', 'move', 'upload', 'share', 'rename') NOT NULL, \`name\` varchar(255) NOT NULL, \`fileAssetId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`client\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`secret\` varchar(255) NOT NULL, \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL, \`type\` enum ('retrieval', 'update', 'full') NOT NULL, \`clientUserId\` int NOT NULL, UNIQUE INDEX \`IDX_1877f4f250c9271781a8eb70f9\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`agency\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL, \`code\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_6f0631732d20c4ad2c459bb51f\` (\`uuid\`), UNIQUE INDEX \`IDX_fbda24d0286deca69d0b8d30f1\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`transaction\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`fileSessionId\` varchar(255) NULL, \`name\` varchar(255) NOT NULL, \`status\` enum ('init', 'draft', 'uploaded', 'failed', 'completed', 'revoked') NOT NULL DEFAULT 'init', \`type\` enum ('upload', 'share', 'transfer', 'upload_share', 'upload_transfer', 'widget') NOT NULL, \`category\` enum ('file', 'future development') NOT NULL, \`expireAt\` datetime NULL, \`userJson\` json NOT NULL, \`applicationId\` int NOT NULL, \`userId\` int NOT NULL, UNIQUE INDEX \`IDX_fcce0ce5cc7762e90d2cc7e230\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`application\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`eserviceId\` int NOT NULL, UNIQUE INDEX \`IDX_71af2cd4dccba665296d4befbf\` (\`uuid\`), UNIQUE INDEX \`composite\` (\`eserviceId\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`eservice_tag\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`eserviceId\` int NOT NULL, UNIQUE INDEX \`IDX_fd99e0104b9aafe4da7b77943f\` (\`uuid\`), UNIQUE INDEX \`composite\` (\`eserviceId\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`eservice\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`webhookUrl\` varchar(255) NULL, \`publicKey\` varchar(255) NULL, \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL, \`agencyId\` int NOT NULL, UNIQUE INDEX \`IDX_83dcc280e19256536e3b7c9071\` (\`uuid\`), UNIQUE INDEX \`composite\` (\`agencyId\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_event\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` enum ('upload', 'share', 'download', 'create', 'login', 'logout') NOT NULL, \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`identityId\` varchar(255) NULL, \`name\` varchar(255) NULL, \`gender\` enum ('unknown', 'male', 'female', 'notApplicable') NOT NULL, \`email\` varchar(255) NULL, \`unverifiedEmail\` varchar(255) NULL, \`phoneNumber\` varchar(255) NULL, \`unverifiedPhoneNumber\` varchar(255) NULL, \`type\` enum ('agency', 'citizen', 'client') NOT NULL, \`isOnboarded\` tinyint NOT NULL DEFAULT 0, \`isAcceptedTNC\` tinyint NOT NULL DEFAULT 0, \`status\` enum ('active', 'suspended', 'pending', 'expired') NOT NULL, \`role\` enum ('USER', 'BETA_USER', 'TESTER', 'ADMIN', 'SUPER_ADMIN', '4', '3', '2', '1', '0') NOT NULL DEFAULT '0', \`salt\` varchar(255) NULL, \`lastLoginAt\` datetime NULL, \`agencyDept\` varchar(255) NULL, \`address\` varchar(255) NULL, UNIQUE INDEX \`IDX_a95e949168be7b7ece1a2382fe\` (\`uuid\`), INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` (\`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`file_asset\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`documentHash\` varchar(255) NULL, \`documentType\` enum ('oa', 'pdf', 'jpeg', 'jpg', 'png', 'zip', 'unknown') NOT NULL, \`type\` enum ('uploaded', 'transferred', 'shared') NOT NULL, \`size\` int NOT NULL, \`status\` enum ('init', 'scanning', 'clean', 'failed', 'active', 'expired', 'pending') NOT NULL, \`path\` varchar(255) NULL, \`failCategory\` enum ('virus', 'scanError', 'uploadToStaging', 'uploadMove', 'transferMove') NULL, \`failReason\` longtext NULL, \`permission\` enum ('full', 'read', 'share', 'download') NOT NULL, \`thumbnailPath\` varchar(255) NULL, \`metadata\` json NOT NULL, \`expireAt\` datetime NULL, \`parentId\` int NULL, \`ownerId\` int NOT NULL, \`sharerId\` int NULL, \`symlinkId\` int NULL, UNIQUE INDEX \`IDX_e681a95026c566dc113cbf1de7\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`activity\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`containerId\` varchar(255) NULL, \`status\` enum ('init', 'scanning', 'clean', 'failed', 'completed', 'seen', 'notSeen', 'revoked', 'sent') NOT NULL, \`requestRequirements\` json NULL, \`pin\` varchar(255) NULL, \`expireAt\` datetime NULL, \`type\` enum ('upload', 'send_share', 'receive_share', 'send_transfer', 'receive_transfer', 'send_file_request', 'receive_file_request', 'send_file_send_file_request', 'receive_file_receive_file_request') NOT NULL, \`parentId\` int NULL, \`transactionId\` int NOT NULL, \`userId\` int NOT NULL, UNIQUE INDEX \`IDX_d848e62c1a30e6fd2091b935c4\` (\`uuid\`), UNIQUE INDEX \`IDX_10a94c6f5da08d97991edce0b2\` (\`containerId\`, \`transactionId\`, \`type\`, \`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`eservice_user\` (\`eserviceId\` int NOT NULL, \`userId\` int NOT NULL, INDEX \`IDX_dc2d99508080fccbe8d2386551\` (\`eserviceId\`), INDEX \`IDX_7e2db0baa4f10e159c9f939cd1\` (\`userId\`), PRIMARY KEY (\`eserviceId\`, \`userId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`activity_file\` (\`activityId\` int NOT NULL, \`fileAssetId\` int NOT NULL, INDEX \`IDX_b32268b51ece2cac9a6e458018\` (\`activityId\`), INDEX \`IDX_57f819b1a3cfe27c216ef44461\` (\`fileAssetId\`), PRIMARY KEY (\`activityId\`, \`fileAssetId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`file_asset_history\` ADD CONSTRAINT \`FK_36135b7667359e85cd9bd7642de\` FOREIGN KEY (\`fileAssetId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`client\` ADD CONSTRAINT \`FK_31edca1e59f9b535db01634283a\` FOREIGN KEY (\`clientUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_8470f62bbad230ae56425fd01a8\` FOREIGN KEY (\`applicationId\`) REFERENCES \`application\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_605baeb040ff0fae995404cea37\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`application\` ADD CONSTRAINT \`FK_598c9847c5af2155aeff71091c1\` FOREIGN KEY (\`eserviceId\`) REFERENCES \`eservice\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`eservice_tag\` ADD CONSTRAINT \`FK_479b63f596f4374530a2ecca2a9\` FOREIGN KEY (\`eserviceId\`) REFERENCES \`eservice\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`eservice\` ADD CONSTRAINT \`FK_f8abdb3523d0c18de6665578a90\` FOREIGN KEY (\`agencyId\`) REFERENCES \`agency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_event\` ADD CONSTRAINT \`FK_77452fe8443c349b0e628507cbb\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_cc31fe4ec7d51289995521f2a2d\` FOREIGN KEY (\`parentId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_d047ac9d3593f64e230fb8ce7b4\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_191fe0980782e30df1c0e0a2676\` FOREIGN KEY (\`sharerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`file_asset\` ADD CONSTRAINT \`FK_a2b574790ae615d32676f214ca7\` FOREIGN KEY (\`symlinkId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_f1253e909ae2f1ea48c44d2d5a9\` FOREIGN KEY (\`parentId\`) REFERENCES \`activity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_3cbc7051353177d814a77ea6d86\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_3571467bcbe021f66e2bdce96ea\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`eservice_user\` ADD CONSTRAINT \`FK_dc2d99508080fccbe8d2386551e\` FOREIGN KEY (\`eserviceId\`) REFERENCES \`eservice\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`eservice_user\` ADD CONSTRAINT \`FK_7e2db0baa4f10e159c9f939cd10\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity_file\` ADD CONSTRAINT \`FK_b32268b51ece2cac9a6e458018c\` FOREIGN KEY (\`activityId\`) REFERENCES \`activity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activity_file\` ADD CONSTRAINT \`FK_57f819b1a3cfe27c216ef44461a\` FOREIGN KEY (\`fileAssetId\`) REFERENCES \`file_asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`activity_file\` DROP FOREIGN KEY \`FK_57f819b1a3cfe27c216ef44461a\``);
    await queryRunner.query(`ALTER TABLE \`activity_file\` DROP FOREIGN KEY \`FK_b32268b51ece2cac9a6e458018c\``);
    await queryRunner.query(`ALTER TABLE \`eservice_user\` DROP FOREIGN KEY \`FK_7e2db0baa4f10e159c9f939cd10\``);
    await queryRunner.query(`ALTER TABLE \`eservice_user\` DROP FOREIGN KEY \`FK_dc2d99508080fccbe8d2386551e\``);
    await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\``);
    await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3cbc7051353177d814a77ea6d86\``);
    await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_f1253e909ae2f1ea48c44d2d5a9\``);
    await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_a2b574790ae615d32676f214ca7\``);
    await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_191fe0980782e30df1c0e0a2676\``);
    await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_d047ac9d3593f64e230fb8ce7b4\``);
    await queryRunner.query(`ALTER TABLE \`file_asset\` DROP FOREIGN KEY \`FK_cc31fe4ec7d51289995521f2a2d\``);
    await queryRunner.query(`ALTER TABLE \`user_event\` DROP FOREIGN KEY \`FK_77452fe8443c349b0e628507cbb\``);
    await queryRunner.query(`ALTER TABLE \`eservice\` DROP FOREIGN KEY \`FK_f8abdb3523d0c18de6665578a90\``);
    await queryRunner.query(`ALTER TABLE \`eservice_tag\` DROP FOREIGN KEY \`FK_479b63f596f4374530a2ecca2a9\``);
    await queryRunner.query(`ALTER TABLE \`application\` DROP FOREIGN KEY \`FK_598c9847c5af2155aeff71091c1\``);
    await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_605baeb040ff0fae995404cea37\``);
    await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_8470f62bbad230ae56425fd01a8\``);
    await queryRunner.query(`ALTER TABLE \`client\` DROP FOREIGN KEY \`FK_31edca1e59f9b535db01634283a\``);
    await queryRunner.query(`ALTER TABLE \`file_asset_history\` DROP FOREIGN KEY \`FK_36135b7667359e85cd9bd7642de\``);
    await queryRunner.query(`DROP INDEX \`IDX_57f819b1a3cfe27c216ef44461\` ON \`activity_file\``);
    await queryRunner.query(`DROP INDEX \`IDX_b32268b51ece2cac9a6e458018\` ON \`activity_file\``);
    await queryRunner.query(`DROP TABLE \`activity_file\``);
    await queryRunner.query(`DROP INDEX \`IDX_7e2db0baa4f10e159c9f939cd1\` ON \`eservice_user\``);
    await queryRunner.query(`DROP INDEX \`IDX_dc2d99508080fccbe8d2386551\` ON \`eservice_user\``);
    await queryRunner.query(`DROP TABLE \`eservice_user\``);
    await queryRunner.query(`DROP INDEX \`IDX_10a94c6f5da08d97991edce0b2\` ON \`activity\``);
    await queryRunner.query(`DROP INDEX \`IDX_d848e62c1a30e6fd2091b935c4\` ON \`activity\``);
    await queryRunner.query(`DROP TABLE \`activity\``);
    await queryRunner.query(`DROP INDEX \`IDX_e681a95026c566dc113cbf1de7\` ON \`file_asset\``);
    await queryRunner.query(`DROP TABLE \`file_asset\``);
    await queryRunner.query(`DROP INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` ON \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_a95e949168be7b7ece1a2382fe\` ON \`user\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`user_event\``);
    await queryRunner.query(`DROP INDEX \`composite\` ON \`eservice\``);
    await queryRunner.query(`DROP INDEX \`IDX_83dcc280e19256536e3b7c9071\` ON \`eservice\``);
    await queryRunner.query(`DROP TABLE \`eservice\``);
    await queryRunner.query(`DROP INDEX \`composite\` ON \`eservice_tag\``);
    await queryRunner.query(`DROP INDEX \`IDX_fd99e0104b9aafe4da7b77943f\` ON \`eservice_tag\``);
    await queryRunner.query(`DROP TABLE \`eservice_tag\``);
    await queryRunner.query(`DROP INDEX \`composite\` ON \`application\``);
    await queryRunner.query(`DROP INDEX \`IDX_71af2cd4dccba665296d4befbf\` ON \`application\``);
    await queryRunner.query(`DROP TABLE \`application\``);
    await queryRunner.query(`DROP INDEX \`IDX_fcce0ce5cc7762e90d2cc7e230\` ON \`transaction\``);
    await queryRunner.query(`DROP TABLE \`transaction\``);
    await queryRunner.query(`DROP INDEX \`IDX_fbda24d0286deca69d0b8d30f1\` ON \`agency\``);
    await queryRunner.query(`DROP INDEX \`IDX_6f0631732d20c4ad2c459bb51f\` ON \`agency\``);
    await queryRunner.query(`DROP TABLE \`agency\``);
    await queryRunner.query(`DROP INDEX \`IDX_1877f4f250c9271781a8eb70f9\` ON \`client\``);
    await queryRunner.query(`DROP TABLE \`client\``);
    await queryRunner.query(`DROP TABLE \`file_asset_history\``);
  }
}
