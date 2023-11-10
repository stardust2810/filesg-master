import { generateSqsClientConfigOptions, SqsModule as BaseSqsModule } from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Module } from '@nestjs/common';

import { FileSGConfigService } from '../../setups/config/config.service';
import { SqsService } from './sqs.service';

@Module({
  providers: [SqsService],
  exports: [SqsService],
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
  ],
})
export class AwsModule {}
