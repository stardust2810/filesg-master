import { SESv2Client, SESv2ClientConfig } from '@aws-sdk/client-sesv2';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { SES_CLIENT, SES_MODULE_OPTIONS, SesModuleAsyncOptions } from '../../typings/ses.typing';
import { SesService } from './ses.service';

@Module({})
export class SesModule {
  static forRoot(): DynamicModule {
    return {
      module: SesModule,
      providers: [
        SesService,
        {
          provide: SES_CLIENT,
          useFactory: () => {
            return new SESv2Client({ region: 'ap-southeast-1' });
          },
        },
      ],
      exports: [SesService],
    };
  }

  static forRootAsync(options: SesModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: SES_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: SesModule,
      imports: options.imports,
      providers: [
        paramsProvider,
        SesService,
        {
          provide: SES_CLIENT,
          useFactory: (s3Config: SESv2ClientConfig) => {
            return new SESv2Client(s3Config);
          },
          inject: [SES_MODULE_OPTIONS],
        },
      ],
      exports: [SesService],
    };
  }
}
