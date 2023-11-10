import { AwsCredentialIdentity } from '@aws-sdk/types';
import { StsService as BaseStsService } from '@filesg/aws';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class StsService {
  private logger = new Logger(StsService.name);
  private assumedScanMoveRole: AwsCredentialIdentity;

  constructor(private readonly baseStsService: BaseStsService, private readonly fileSGConfigService: FileSGConfigService) {}

  async assumeScanMoveRole() {
    const { scanMoveRoleArn, assumeRoleSessionDuration } = this.fileSGConfigService.awsConfig;

    if (!this.assumedScanMoveRole || this.assumedScanMoveRole.expiration! <= new Date()) {
      // eslint-disable-next-line sonarjs/no-nested-template-literals
      this.logger.log(`Role ${this.assumedScanMoveRole ? `is expired, expiry ${this.assumedScanMoveRole.expiration}` : 'does not exist'}`);

      this.assumedScanMoveRole = await this.baseStsService.assumeRoleInSts(scanMoveRoleArn, 'scan-move', assumeRoleSessionDuration);
    } else {
      this.logger.log(`Existing role found, returning role`);
    }

    return this.assumedScanMoveRole;
  }
}
