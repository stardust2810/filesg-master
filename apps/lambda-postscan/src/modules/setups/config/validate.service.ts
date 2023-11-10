import { ConfigException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Logger } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AWSEnvironmentVariables } from './aws-config.service';
import { SystemEnvironmentVariables } from './system-config.service';

type EnvironmentVariables = SystemEnvironmentVariables | AWSEnvironmentVariables;

export function validateEnvConfig(config: Record<string, unknown>) {
  const allEnvironmentVariables = [SystemEnvironmentVariables, AWSEnvironmentVariables];
  const combineValidatedConfig = {};

  try {
    allEnvironmentVariables.forEach((environment) => {
      const validatedConfig = validateEnvironmentVaribles(config, environment);
      Object.assign(combineValidatedConfig, validatedConfig);
    });
  } catch (err) {
    Logger.error(`Env validation failed: ${(err as ConfigException).message}`, 'ValidateEnvConfig');
    process.exit(1);
  }
  return combineValidatedConfig;
}

function validateEnvironmentVaribles(config: Record<string, unknown>, envVariables: ClassConstructor<EnvironmentVariables>) {
  const validatedConfig = plainToClass(envVariables, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
  const configErrors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (configErrors.length > 0) {
    throw new ConfigException(COMPONENT_ERROR_CODE.CONFIG_VALIDATE, envVariables.name, configErrors.toString());
  }
  return validatedConfig;
}
