import { DynamicModule, Module, Provider } from '@nestjs/common';

import { PdfService } from './pdf.service';
import { PDF_MODULE_OPTIONS, PdfConfig, PdfModuleAsyncOptions } from './pdf.typings';

@Module({})
export class PdfModule {
  static forRoot(config: PdfConfig): DynamicModule {
    const paramsProvider: Provider = {
      provide: PDF_MODULE_OPTIONS,
      useValue: config,
    };

    return {
      module: PdfModule,
      providers: [paramsProvider, PdfService],
      exports: [PdfService],
    };
  }

  static forRootAsync(options: PdfModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: PDF_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: PdfModule,
      providers: [paramsProvider, PdfService],
      exports: [PdfService],
    };
  }
}
