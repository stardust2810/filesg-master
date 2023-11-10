import { ConfigException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Logger } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AwsEnvironmentVariables } from './aws-config.service';
import { SystemEnvironmentVariables } from './system-config.service';

type EnvironmentVariables = SystemEnvironmentVariables | AwsEnvironmentVariables;

export function validateEnvConfig(config: Record<string, unknown>) {
  const allEnvironmentVariables = [SystemEnvironmentVariables, AwsEnvironmentVariables];

  const combinedValidatedConfig = {};

  try {
    allEnvironmentVariables.forEach((environment) => {
      const validatedConfig = validateEnvironmentVariables(config, environment);
      Object.assign(combinedValidatedConfig, validatedConfig);
    });
  } catch (err) {
    Logger.error(`Env validation failed: ${(err as ConfigException).message}`, 'ValidateEnvConfig');
    process.exit(1);
  }

  return combinedValidatedConfig;
}

function validateEnvironmentVariables(config: Record<string, unknown>, envVariables: ClassConstructor<EnvironmentVariables>) {
  const transformedConfig = plainToClass(envVariables, config, { excludeExtraneousValues: true });
  const configErrors = validateSync(transformedConfig, { skipMissingProperties: false });

  if (configErrors.length > 0) {
    throw new ConfigException(COMPONENT_ERROR_CODE.CONFIG_VALIDATE, envVariables.name, configErrors.toString());
  }

  return transformedConfig;
}
