import { LambdaClient, LambdaClientConfig } from '@aws-sdk/client-lambda';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { LAMBDA_CLIENT, LAMBDA_MODULE_OPTIONS, LambdaModuleAsyncOptions } from '../../typings/lambda.typing';
import { LambdaService } from './lambda.service';

@Module({})
export class LambdaModule {
  static forRoot(): DynamicModule {
    return {
      module: LambdaModule,
      providers: [
        LambdaService,
        {
          provide: LAMBDA_CLIENT,
          useFactory: () => {
            return new LambdaClient({ region: 'ap-southeast-1' });
          },
        },
      ],
      exports: [LambdaService],
    };
  }

  static forRootAsync(options: LambdaModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: LAMBDA_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: LambdaModule,
      imports: options.imports,
      providers: [
        paramsProvider,
        LambdaService,
        {
          provide: LAMBDA_CLIENT,
          useFactory: (lambdaConfig: LambdaClientConfig) => {
            return new LambdaClient(lambdaConfig);
          },
          inject: [LAMBDA_MODULE_OPTIONS],
        },
      ],
      exports: [LambdaService],
    };
  }
}
