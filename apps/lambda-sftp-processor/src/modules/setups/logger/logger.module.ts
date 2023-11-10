import { LoggerModule as FSGLoggerModule } from '@filesg/logger';

import { FileSGConfigModule } from '../config/config.module';
import { FileSGConfigService } from '../config/config.service';

export const FileSGLoggerModule = FSGLoggerModule.forRootAsync({
  imports: [FileSGConfigModule],
  inject: [FileSGConfigService],
  useFactory: (configService: FileSGConfigService) => {
    const { logLevel, env } = configService.systemConfig;

    return {
      logLevel,
      env,
    };
  },
});
