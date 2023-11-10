import { AssumeRoleCommand, STSClient, Tag } from '@aws-sdk/client-sts';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { AWSHttpException } from '../../common/filters/custom-exceptions';
import { LOG_OPERATION_NAME_PREFIX } from '../../const';
import { STS_CLIENT } from '../../typings/sts.typing';

@Injectable()
export class StsService {
  private readonly logger = new Logger(StsService.name);

  constructor(@Inject(STS_CLIENT) private readonly sts: STSClient) {}

  // ===========================================================================
  // Base
  // ===========================================================================
  public async assumeRoleInSts(
    roleArn: string,
    roleSessionName: string,
    durationSeconds: number,
    tags?: Tag[],
  ): Promise<AwsCredentialIdentity> {
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.STS} Assuming role for ${durationSeconds}s`;
    this.logger.log(taskMessage);
    this.logger.debug(`Role ARN: ${roleArn}, Role Session name: ${roleSessionName}`);

    try {
      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: roleSessionName,
        DurationSeconds: durationSeconds,
        Tags: tags,
      });

      const { Credentials: roleCredentials } = await this.sts.send(assumeRoleCommand);

      if (!roleCredentials || !roleCredentials.AccessKeyId || !roleCredentials.SecretAccessKey) {
        throw new AWSHttpException(COMPONENT_ERROR_CODE.STS_SERVICE, 'No credential found');
      }

      this.logger.log(`[Succeed] ${taskMessage}`);

      return {
        accessKeyId: roleCredentials.AccessKeyId,
        secretAccessKey: roleCredentials.SecretAccessKey,
        sessionToken: roleCredentials.SessionToken,
        expiration: roleCredentials.Expiration,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.STS_SERVICE, errorMessage);
    }
  }
}
