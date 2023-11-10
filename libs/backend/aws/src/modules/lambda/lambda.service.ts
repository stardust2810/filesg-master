import { InvokeCommand, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { AWSHttpException } from '../../common/filters/custom-exceptions';
import { LOG_OPERATION_NAME_PREFIX } from '../../const';
import { LAMBDA_CLIENT } from '../../typings/lambda.typing';
import { generateLambdaClientConfigOptions } from '../../utils/helpers';

interface LambdaInvocationInput {
  functionName: string;
  payload: Record<string, any>;
}

// gd TODO: add tests
@Injectable()
export class LambdaService {
  private readonly logger = new Logger(LambdaService.name);

  constructor(@Inject(LAMBDA_CLIENT) private readonly lambda: LambdaClient) {}

  // ===========================================================================
  // Create Client
  // ===========================================================================
  async createAssumedClient(credentials: AwsCredentialIdentity, region: string, isLocalStackOn = false) {
    this.logger.log(`${LOG_OPERATION_NAME_PREFIX.LAMBDA} Creating assumed client`);

    return new LambdaClient(generateLambdaClientConfigOptions({ credentials, region }, isLocalStackOn));
  }

  // ===========================================================================
  // Invocation
  // ===========================================================================
  async invokeLambda(invocationInput: LambdaInvocationInput, lambdaClient?: LambdaClient): Promise<InvokeCommandOutput> {
    const { functionName, payload } = invocationInput;

    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.LAMBDA} Invoking lambda ${functionName}`;
    this.logger.log(taskMessage);

    try {
      const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: Buffer.from(JSON.stringify(payload)),
      });

      const client = this.providedLambdaClient(lambdaClient);

      const data = await client.send(command);
      this.logger.log(`[Succeed] ${taskMessage}. Data: ${JSON.stringify(data)}`);

      return data;
    } catch (error) {
      this.logger.error(`Failed invoking lambda. Error: ${JSON.stringify(error)}`);
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage);
    }
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private providedLambdaClient(lambdaClient?: LambdaClient) {
    return lambdaClient ?? this.lambda;
  }
}
