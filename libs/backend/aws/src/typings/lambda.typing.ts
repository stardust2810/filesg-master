import { LambdaClientConfig } from '@aws-sdk/client-lambda';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export const LAMBDA_CLIENT = Symbol('LAMBDA_CLIENT');
export const LAMBDA_MODULE_OPTIONS = Symbol('LAMBDA_MODULE_OPTIONS');

export interface LambdaModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => LambdaClientConfig | Promise<LambdaClientConfig>;
  inject?: any[];
}
