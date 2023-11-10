import { SecretsManager, SecretsManagerClientConfig } from '@aws-sdk/client-secrets-manager';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { SM_CLIENT, SM_MODULE_OPTIONS, SmModuleAsyncOptions } from '../../typings/sm.typing';
import { SqsService } from '../sqs/sqs.service';
import { SmService } from './sm.service';

@Module({})
export class SmModule {
  static forRoot(): DynamicModule {
    return {
      module: SmModule,
      providers: [
        SmService,
        {
          provide: SM_CLIENT,
          useFactory: () => {
            return new SecretsManager({ region: 'ap-southeast-1' });
          },
        },
      ],
      exports: [SqsService],
    };
  }

  static forRootAsync(options: SmModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: SM_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: SmModule,
      imports: options.imports,
      providers: [
        paramsProvider,
        SmService,
        {
          provide: SM_CLIENT,
          useFactory: (s3Config: SecretsManagerClientConfig) => {
            return new SecretsManager(s3Config);
          },
          inject: [SM_MODULE_OPTIONS],
        },
      ],
      exports: [SmService],
    };
  }
}
