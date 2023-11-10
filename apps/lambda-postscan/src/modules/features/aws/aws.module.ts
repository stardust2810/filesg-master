import {
  generateS3ClientConfigOptions,
  generateSqsClientConfigOptions,
  generateStsClientConfigOptions,
  S3Module as BaseS3Module,
  SqsModule as BaseSqsModule,
  StsModule as BaseStsModule,
} from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Module } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';
import { S3Service } from './s3.service';
import { SqsService } from './sqs.service';
import { StsService } from './sts.service';

@Module({
  providers: [SqsService, S3Service, StsService],
  exports: [SqsService, S3Service, StsService],
  imports: [
    BaseS3Module.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateS3ClientConfigOptions(
          {
            region: configService.awsConfig.region,
          },
          isLocalstackOn,
        );
      },
    }),
    BaseSqsModule.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateSqsClientConfigOptions(
          {
            region: configService.awsConfig.region,
          },
          isLocalstackOn,
        );
      },
    }),
    BaseStsModule.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateStsClientConfigOptions(
          {
            region: configService.awsConfig.region,
          },
          isLocalstackOn,
        );
      },
    }),
  ],
})
export class AwsModule {}
