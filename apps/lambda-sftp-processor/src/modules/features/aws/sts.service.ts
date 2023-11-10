import { AwsCredentialIdentity } from '@aws-sdk/types';
import { StsService as BaseStsService } from '@filesg/aws';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class StsService {
  private logger = new Logger(StsService.name);
  private assumedSftpProcessorRole: AwsCredentialIdentity;

  constructor(private readonly baseStsService: BaseStsService, private readonly fileSGConfigService: FileSGConfigService) {}

  async assumeSftpProcessorRole() {
    const { sftpRoleArn, assumeRoleSessionDuration } = this.fileSGConfigService.awsConfig;

    if (!this.assumedSftpProcessorRole || this.assumedSftpProcessorRole.expiration! <= new Date()) {
      this.logger.log(
        // eslint-disable-next-line sonarjs/no-nested-template-literals
        `Role ${this.assumedSftpProcessorRole ? `is expired, expiry ${this.assumedSftpProcessorRole.expiration}` : 'does not exist'}`,
      );

      this.assumedSftpProcessorRole = await this.baseStsService.assumeRoleInSts(sftpRoleArn, 'sftp-processor', assumeRoleSessionDuration);
    } else {
      this.logger.log(`Existing role found, returning role`);
    }

    return this.assumedSftpProcessorRole;
  }
}
