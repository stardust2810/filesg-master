import { ModuleMetadata } from '@nestjs/common';

export const PDF_MODULE_OPTIONS = Symbol('PDF_MODULE_OPTIONS');

export interface PdfConfig {
  jarFilePath: string;
}

export interface PdfModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => PdfConfig | Promise<PdfConfig>;
  inject?: any[];
}
