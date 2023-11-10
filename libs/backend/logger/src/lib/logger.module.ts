import { DynamicModule, Module, Provider } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { LOGGER_MODULE_OPTIONS } from './logger.const';
import { LoggerModuleAsyncOptions,LoggerModuleOptions } from './logger.typing';
import { getPinoLoggerConfig } from './logger.util';

@Module({})
export class LoggerModule {
  static forRoot({ logLevel, env }: LoggerModuleOptions): DynamicModule {
    return PinoLoggerModule.forRoot(getPinoLoggerConfig(logLevel, env));
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    const paramsProvider: Provider = {
      provide: LOGGER_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return PinoLoggerModule.forRootAsync({
      providers: [paramsProvider],
      inject: [LOGGER_MODULE_OPTIONS],
      useFactory: ({ logLevel, env }: LoggerModuleOptions) => getPinoLoggerConfig(logLevel, env),
    });
  }
}
