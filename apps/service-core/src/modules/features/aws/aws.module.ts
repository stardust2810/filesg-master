import {
  generateSesClientConfigOptions,
  generateSnsClientConfigOptions,
  generateSqsClientConfigOptions,
  SesModule as BaseSesModule,
  SnsModule as BaseSnsModule,
  SqsModule as BaseSqsModule,
} from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Module } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';
import { SesService } from './ses.service';
import { SnsService } from './sns.service';
import { SqsService } from './sqs.service';

@Module({
  providers: [SqsService, SesService, SnsService],
  exports: [SqsService, SesService, SnsService],
  imports: [
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
    BaseSesModule.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateSesClientConfigOptions(
          {
            region: configService.awsConfig.region,
          },
          isLocalstackOn,
        );
      },
    }),
    BaseSnsModule.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateSnsClientConfigOptions(
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
