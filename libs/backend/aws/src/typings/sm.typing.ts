import { SecretsManagerClientConfig } from '@aws-sdk/client-secrets-manager';
import { ModuleMetadata } from '@nestjs/common';

export const SM_CLIENT = Symbol('SM_CLIENT');
export const SM_MODULE_OPTIONS = Symbol('SM_MODULE_OPTIONS');

export interface SmModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => SecretsManagerClientConfig | Promise<SecretsManagerClientConfig>;
  inject?: any[];
}
