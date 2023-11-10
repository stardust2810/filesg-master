import {
  generateSmClientConfigOptions,
  generateStsClientConfigOptions,
  SmModule as BaseSmModule,
  StsModule as BaseStsModule,
} from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Module } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';
import { SmService } from './sm.service';
import { StsService } from './sts.service';

@Module({
  providers: [SmService, StsService],
  imports: [
    BaseSmModule.forRootAsync({
      inject: [FileSGConfigService],
      useFactory: (configService: FileSGConfigService) => {
        const isLocalstackOn = configService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

        return generateSmClientConfigOptions(
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
  exports: [SmService, StsService],
})
export class AwsModule {}
