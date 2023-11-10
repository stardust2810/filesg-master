import { STSClientConfig } from "@aws-sdk/client-sts";
import { ModuleMetadata } from "@nestjs/common";

export const STS_CLIENT = Symbol('STS_CLIENT');
export const STS_MODULE_OPTIONS = Symbol('STS_MODULE_OPTIONS');

export interface StsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => STSClientConfig | Promise<STSClientConfig>;
  inject?: any[];
}
