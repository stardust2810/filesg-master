import { ConfigException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Logger } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AgencyEnvironmentVariables } from './agency-client-config.service';
import { AuthEnvironmentVariables } from './auth-config.service';
import { AWSEnvironmentVariables } from './aws-config.service';
import { DatabaseEnvironmentVariables } from './database-config.service';
import { MyinfoEnvironmentVariables } from './myinfo-config.service';
import { NonSingpassAuthEnvironmentVariables } from './non-singpass-auth-config.service';
import { NotificationEnvironmentVariables } from './notification-config.service';
import { OaEnvironmentVariables } from './oa-config.service';
import { OtpEnvironmentVariables } from './otp-config.service';
import { RedisEnvironmentVariables } from './redis-config.service';
import { SessionEnvironmentVariables } from './session-config.service';
import { SingpassEnvironmentVariables } from './singpass-config.service';
import { SystemEnvironmentVariables } from './system-config.service';

type EnvironmentVariables =
  | SystemEnvironmentVariables
  | SingpassEnvironmentVariables
  | RedisEnvironmentVariables
  | OtpEnvironmentVariables
  | AuthEnvironmentVariables
  | AWSEnvironmentVariables
  | MyinfoEnvironmentVariables
  | DatabaseEnvironmentVariables
  | NotificationEnvironmentVariables
  | NonSingpassAuthEnvironmentVariables
  | SessionEnvironmentVariables
  | OaEnvironmentVariables
  | AgencyEnvironmentVariables;

export function validateEnvConfig(config: Record<string, unknown>) {
  const allEnvironmentVariables = [
    SystemEnvironmentVariables,
    SingpassEnvironmentVariables,
    RedisEnvironmentVariables,
    OtpEnvironmentVariables,
    AuthEnvironmentVariables,
    AWSEnvironmentVariables,
    MyinfoEnvironmentVariables,
    DatabaseEnvironmentVariables,
    NotificationEnvironmentVariables,
    NonSingpassAuthEnvironmentVariables,
    SessionEnvironmentVariables,
    OaEnvironmentVariables,
    AgencyEnvironmentVariables,
  ];

  const combineValidatedConfig = {};

  try {
    allEnvironmentVariables.forEach((environment) => {
      const validatedConfig = validateEnvironmentVariables(config, environment);
      Object.assign(combineValidatedConfig, validatedConfig);
    });
  } catch (err) {
    Logger.error(`Env validation failed: ${(err as ConfigException).message}`, 'ValidateEnvConfig');
    process.exit(1);
  }

  return combineValidatedConfig;
}

function validateEnvironmentVariables(config: Record<string, unknown>, envVariables: ClassConstructor<EnvironmentVariables>) {
  const transformedConfig = plainToClass(envVariables, config, { excludeExtraneousValues: true });

  const configErrors = validateSync(transformedConfig, { skipMissingProperties: false });

  if (configErrors.length > 0) {
    throw new ConfigException(COMPONENT_ERROR_CODE.CONFIG_VALIDATE, envVariables.name, configErrors.toString());
  }

  return transformedConfig;
}
