import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import {
  generateLambdaClientConfigOptions,
  generateS3ClientConfigOptions,
  generateSqsClientConfigOptions,
  generateStsClientConfigOptions,
  LambdaModule as BaseLambdaModule,
  S3Module as BaseS3Module,
  SqsModule as BaseSqsModule,
  StsModule as BaseStsModule,
} from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Module } from '@nestjs/common';

import { AWS_LAMBDA_NODE_HTTPS_HANDLER_PROVIDER } from '../../../typings/common';
import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { FileSGConfigService } from '../../setups/config/config.service';
import { HttpAgentModule } from '../../setups/http-agent/http-agent.module';
import { S3Service } from './s3.service';
import { SqsService } from './sqs.service';
import { StsService } from './sts.service';

/**
 * Only explicitly injecting the nodeHttpsHandler in transfer service aws module due to following reasons:
 *
 * 1. transfer service s3 createAssumedClient is called very frequent during high load and could
 * cause issues to network from the initialisation of s3 clients with different temporary credentials.
 * If not keeping the connection alive by using https agent, could result in high amount of TCP handshake and
 * DNS resolution which results in a lot of DNS errors.
 * 2. Even though some lambdas do call s3 createAssumedClient, but considering each lambda instance has short live
 * time (compared to transfer service) and the load of calling within the instance life span wont be as frequent as transfer service.
 * Temporarily not explicitly injecting the nodeHttpsHandler first until there is a need in the future for enhancement.
 *
 * Http keepAlive is turned on by default in AWS SDK V3. Hence, there is no need to explicitly configure it
 * in other app (e.g. lambda, core)
 * https://aws.amazon.com/blogs/developer/http-keep-alive-is-on-by-default-in-modular-aws-sdk-for-javascript/
 */
// gd TODO: temporarily comment out until bug is fixed
@Module({
  providers: [S3Service, SqsService, StsService],
  exports: [S3Service, SqsService, StsService],
  imports: [
    // HttpAgentModule, // this is imported to inject nodeHttpsHandler to be used for the s3 createAssumedClient
    ApiClientModule,
    BaseS3Module.forRootAsync({
      // imports: [HttpAgentModule],
      inject: [
        FileSGConfigService,
        // NODE_HTTPS_HANDLER_PROVIDER
      ],
      useFactory: (
        configService: FileSGConfigService,
        // nodeHttpsHandler: NodeHttpHandler
      ) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateS3ClientConfigOptions(
          {
            region: configService.awsConfig.region,
            // requestHandler: nodeHttpsHandler
          },
          isLocalstackOn,
        );
      },
    }),
    BaseSqsModule.forRootAsync({
      // imports: [HttpAgentModule],
      inject: [
        FileSGConfigService,
        // NODE_HTTPS_HANDLER_PROVIDER
      ],
      useFactory: (
        configService: FileSGConfigService,
        // nodeHttpsHandler: NodeHttpHandler
      ) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateSqsClientConfigOptions(
          {
            region: configService.awsConfig.region,
            // requestHandler: nodeHttpsHandler
          },
          isLocalstackOn,
        );
      },
    }),
    BaseStsModule.forRootAsync({
      // imports: [HttpAgentModule],
      inject: [
        FileSGConfigService,
        // NODE_HTTPS_HANDLER_PROVIDER
      ],
      useFactory: (
        configService: FileSGConfigService,
        // nodeHttpsHandler: NodeHttpHandler
      ) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateStsClientConfigOptions(
          {
            region: configService.awsConfig.region,
            // requestHandler: nodeHttpsHandler
          },
          isLocalstackOn,
        );
      },
    }),
    BaseLambdaModule.forRootAsync({
      imports: [HttpAgentModule],
      inject: [FileSGConfigService, AWS_LAMBDA_NODE_HTTPS_HANDLER_PROVIDER],
      useFactory: (configService: FileSGConfigService, nodeHttpsHandler: NodeHttpHandler) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateLambdaClientConfigOptions(
          { region: configService.awsConfig.region, requestHandler: nodeHttpsHandler, maxAttempts: 0 },
          isLocalstackOn,
        );
      },
    }),
  ],
})
export class AWSModule {}
