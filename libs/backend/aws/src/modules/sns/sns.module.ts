import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { SNS_CLIENT, SNS_MODULE_OPTIONS, SNSModuleAsyncOptions } from '../../typings/sns.typing';
import { SnsService } from './sns.service';

@Module({})
export class SnsModule {
  static forRoot(): DynamicModule {
    return {
      module: SnsModule,
      providers: [
        SnsService,
        {
          provide: SNS_CLIENT,
          useFactory: () => {
            return new SNSClient({ region: 'ap-southeast-1' });
          },
        },
      ],
      exports: [SnsService],
    };
  }

  static forRootAsync(options: SNSModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: SNS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };
    return {
      module: SnsModule,
      imports: options.imports,
      providers: [
        paramsProvider,
        SnsService,
        {
          provide: SNS_CLIENT,
          useFactory: (snsConfig: SNSClientConfig) => {
            return new SNSClient(snsConfig);
          },
          inject: [SNS_MODULE_OPTIONS],
        },
      ],
      exports: [SnsService],
    };
  }
}
