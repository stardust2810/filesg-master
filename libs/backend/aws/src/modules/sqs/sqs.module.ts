import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { SQS_CLIENT, SQS_MODULE_OPTIONS, SqsModuleAsyncOptions } from '../../typings/sqs.typing';
import { SqsService } from './sqs.service';

@Module({})
export class SqsModule {
  static forRoot(): DynamicModule {
    return {
      module: SqsModule,
      providers: [
        SqsService,
        {
          provide: SQS_CLIENT,
          useFactory: () => {
            return new SQSClient({ region: 'ap-southeast-1' });
          },
        },
      ],
      exports: [SqsService],
    };
  }

  static forRootAsync(options: SqsModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: SQS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: SqsModule,
      imports: options.imports,
      providers: [
        paramsProvider,
        SqsService,
        {
          provide: SQS_CLIENT,
          useFactory: (s3Config: SQSClientConfig) => {
            return new SQSClient(s3Config);
          },
          inject: [SQS_MODULE_OPTIONS],
        },
      ],
      exports: [SqsService],
    };
  }
}
