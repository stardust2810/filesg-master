import { AwsCredentialIdentity } from '@aws-sdk/types';
import { StsService as BaseStsService } from '@filesg/aws';
import { UnknownFileSessionTypeException } from '@filesg/backend-common';
import { AssumeDeleteRole, AssumeMoveRole, AssumeTransferMoveRole, COMPONENT_ERROR_CODE, FILE_SESSION_TYPE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class StsService {
  private logger = new Logger(StsService.name);
  private assumedRoleForUpload: AwsCredentialIdentity;

  constructor(private readonly baseStsService: BaseStsService, private readonly fileSGConfigService: FileSGConfigService) {}

  // ===========================================================================
  // Custom
  // ===========================================================================
  public async assumeUploadMoveRole(receiver: string) {
    const { uploadMoveRoleArn, assumeRoleSessionDuration } = this.fileSGConfigService.awsConfig;

    this.logger.log(`Assuming upload move role with receiver tag: ${receiver}`);

    return await this.baseStsService.assumeRoleInSts(uploadMoveRoleArn, 'upload-move', assumeRoleSessionDuration, [
      { Key: 'receiver', Value: receiver },
    ]);
  }

  public async assumeTransferMoveRole(sender: string, receiver: string) {
    const { transferMoveRoleArn, assumeRoleSessionDuration } = this.fileSGConfigService.awsConfig;

    this.logger.log(`Assuming transfer move role with sender tag: ${sender} and receiver tag: ${receiver}`);

    return await this.baseStsService.assumeRoleInSts(transferMoveRoleArn, 'transfer-move', assumeRoleSessionDuration, [
      { Key: 'sender', Value: sender },
      { Key: 'receiver', Value: receiver },
    ]);
  }

  public async assumeUploadRole() {
    const { uploadRoleArn, assumeRoleSessionDuration, assumeRoleExpirationBufferInMs } = this.fileSGConfigService.awsConfig;

    if (
      !this.assumedRoleForUpload ||
      new Date(this.assumedRoleForUpload.expiration!.getTime() - assumeRoleExpirationBufferInMs) <= new Date()
    ) {
      this.assumedRoleForUpload = await this.baseStsService.assumeRoleInSts(uploadRoleArn, 'upload', assumeRoleSessionDuration);
      this.logger.log('Creating new assume role');
    }

    this.logger.log(`Expiration of UploadRole : ${this.assumedRoleForUpload.expiration}`);
    return this.assumedRoleForUpload;
  }

  public async assumeMoveRole(fileSessionType: FILE_SESSION_TYPE, assumeRole: AssumeMoveRole | AssumeTransferMoveRole) {
    let creds: AwsCredentialIdentity;

    switch (fileSessionType) {
      case FILE_SESSION_TYPE.UPLOAD:
        creds = await this.assumeUploadMoveRole(assumeRole.receiver);
        break;

      case FILE_SESSION_TYPE.TRANSFER: {
        const role = assumeRole as AssumeTransferMoveRole;
        creds = await this.assumeTransferMoveRole(role.owner, role.receiver);
        break;
      }

      default:
        throw new UnknownFileSessionTypeException(COMPONENT_ERROR_CODE.STS_SERVICE, fileSessionType, 'assume role');
    }

    return creds;
  }

  async assumeRetrieveRole(owner: string) {
    const { retrieveRoleArn, assumeRoleSessionDuration } = this.fileSGConfigService.awsConfig;
    this.logger.log(`Assuming retrieve move role with owner tag: ${owner}`);

    return await this.baseStsService.assumeRoleInSts(retrieveRoleArn, 'upload', assumeRoleSessionDuration, [
      {
        Key: 'owner',
        Value: owner,
      },
    ]);
  }

  async assumeDeleteRole(assumeRole: AssumeDeleteRole) {
    const { deleteRoleArn, assumeRoleSessionDuration } = this.fileSGConfigService.awsConfig;
    const { owner } = assumeRole;
    this.logger.log(`Assuming delete role with owner tag: ${owner}`);

    return await this.baseStsService.assumeRoleInSts(deleteRoleArn, 'delete', assumeRoleSessionDuration, [
      {
        Key: 'owner',
        Value: owner,
      },
    ]);
  }
}
