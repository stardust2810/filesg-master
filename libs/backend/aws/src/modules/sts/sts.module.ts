import { STSClient, STSClientConfig } from '@aws-sdk/client-sts';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { STS_CLIENT, STS_MODULE_OPTIONS, StsModuleAsyncOptions } from '../../typings/sts.typing';
import { StsService } from './sts.service';

@Module({})
export class StsModule {
  static forRoot(): DynamicModule {
    return {
      module: StsModule,
      providers: [
        StsService,
        {
          provide: STS_CLIENT,
          useFactory: () => {
            return new STSClient({ region: 'ap-southeast-1' });
          },
        },
      ],
      exports: [StsService],
    };
  }

  static forRootAsync(options: StsModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: STS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: StsModule,
      imports: options.imports,
      providers: [
        paramsProvider,
        StsService,
        {
          provide: STS_CLIENT,
          useFactory: (stsConfig: STSClientConfig) => {
            return new STSClient(stsConfig);
          },
          inject: [STS_MODULE_OPTIONS],
        },
      ],
      exports: [StsService],
    };
  }
}
