import {
  generateS3ClientConfigOptions,
  generateStsClientConfigOptions,
  S3Module as BaseS3Module,
  StsModule as BaseStsModule,
} from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Module } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';
import { S3Service } from './s3.service';
import { StsService } from './sts.service';

@Module({
  providers: [S3Service, StsService],
  imports: [
    BaseS3Module.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateS3ClientConfigOptions({ region: configService.awsConfig.region }, isLocalstackOn);
      },
    }),
    BaseStsModule.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateStsClientConfigOptions({ region: configService.awsConfig.region }, isLocalstackOn);
      },
    }),
  ],
  exports: [S3Service, StsService],
})
export class AwsModule {}
