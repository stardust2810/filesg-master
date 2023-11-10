import { AwsCredentialIdentity } from '@aws-sdk/types';
import { StsService as BaseStsService } from '@filesg/aws';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class StsService {
  private logger = new Logger(StsService.name);
  private assumedDocEncryptionRole: AwsCredentialIdentity;

  constructor(private readonly baseStsService: BaseStsService, private readonly fileSGConfigService: FileSGConfigService) {}

  async assumeDocumentEncryptionRole(receiver: string) {
    const { uploadMoveRoleArn: docEncryptionRoleArn, assumeRoleSessionDuration } = this.fileSGConfigService.awsConfig;

    this.logger.log(
      // eslint-disable-next-line sonarjs/no-nested-template-literals
      `Role ${this.assumedDocEncryptionRole ? `is expired, expiry ${this.assumedDocEncryptionRole.expiration}` : 'does not exist'}`,
    );

    return await this.baseStsService.assumeRoleInSts(docEncryptionRoleArn, 'doc-encryption', assumeRoleSessionDuration, [
      { Key: 'receiver', Value: receiver },
    ]);
  }
}
