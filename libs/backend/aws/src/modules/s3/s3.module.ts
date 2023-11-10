import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { S3_CLIENT, S3_MODULE_OPTIONS, S3ModuleAsyncOptions } from '../../typings/s3.typing';
import { S3Service } from './s3.service';

@Module({})
export class S3Module {
  static forRoot(): DynamicModule {
    return {
      module: S3Module,
      providers: [
        S3Service,
        {
          provide: S3_CLIENT,
          useFactory: () => {
            return new S3Client({ region: 'ap-southeast-1' });
          },
        },
      ],
      exports: [S3Service],
    };
  }

  static forRootAsync(options: S3ModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: S3_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: S3Module,
      imports: options.imports,
      providers: [
        paramsProvider,
        S3Service,
        {
          provide: S3_CLIENT,
          useFactory: (s3Config: S3ClientConfig) => {
            return new S3Client(s3Config);
          },
          inject: [S3_MODULE_OPTIONS],
        },
      ],
      exports: [S3Service],
    };
  }
}
