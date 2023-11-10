import { SNSClientConfig } from '@aws-sdk/client-sns';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export const SNS_CLIENT = Symbol('SNS_CLIENT');
export const SNS_MODULE_OPTIONS = Symbol('SNS_MODULE_OPTIONS');

export interface SNSModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => SNSClientConfig | Promise<SNSClientConfig>;
  inject?: any[];
}
