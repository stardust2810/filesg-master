import { ConfigException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Logger } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AwsEnvironmentVariables } from './aws-config.service';
import { JwtEnvironmentVariables } from './jwt-config.service';
import { OAEnvironmentVariables } from './oa-config.service';
import { SystemEnvironmentVariables } from './system-config.service';

type EnvironmentVariables = SystemEnvironmentVariables | AwsEnvironmentVariables | JwtEnvironmentVariables | OAEnvironmentVariables;

export function validateEnvConfig(config: Record<string, unknown>) {
  const allEnvironmentVariables = [SystemEnvironmentVariables, AwsEnvironmentVariables, JwtEnvironmentVariables, OAEnvironmentVariables];

  const combinedValidatedConfig = {};

  try {
    allEnvironmentVariables.forEach((environment) => {
      const validatedConfig = validateEnvironmentVaribles(config, environment);
      Object.assign(combinedValidatedConfig, validatedConfig);
    });
  } catch (err) {
    Logger.error(`Env validation failed: ${(err as ConfigException).message}`, 'ValidateEnvConfig');
    process.exit(1);
  }

  return combinedValidatedConfig;
}

function validateEnvironmentVaribles(config: Record<string, unknown>, envVariables: ClassConstructor<EnvironmentVariables>) {
  const transformedConfig = plainToClass(envVariables, config, { excludeExtraneousValues: true });
  const configErrors = validateSync(transformedConfig, { skipMissingProperties: false });

  if (configErrors.length > 0) {
    throw new ConfigException(COMPONENT_ERROR_CODE.CONFIG_VALIDATE, envVariables.name, configErrors.toString());
  }

  return transformedConfig;
}
