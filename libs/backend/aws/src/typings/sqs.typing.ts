import { SQSClientConfig } from "@aws-sdk/client-sqs";
import { ModuleMetadata } from "@nestjs/common";

export const SQS_CLIENT = Symbol('SQS_CLIENT');
export const SQS_MODULE_OPTIONS = Symbol('SQS_MODULE_OPTIONS');

export interface SqsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => SQSClientConfig | Promise<SQSClientConfig>;
  inject?: any[];
}


