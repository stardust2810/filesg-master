import { CI_ENVIRONMENT, ENVIRONMENT } from '@filesg/common';
import { Logger } from '@nestjs/common';
// eslint-disable-next-line unused-imports/no-unused-imports
import dynamooseLogger from 'dynamoose-logger';
import { DynamooseModule } from 'nestjs-dynamoose';

import { FileSGConfigService } from '../config/config.service';

export const DatabaseModule = DynamooseModule.forRootAsync({
  inject: [FileSGConfigService],
  useFactory: async (fileSGConfigService: FileSGConfigService) => {
    const {
      systemConfig: { env, nodeEnv },
    } = fileSGConfigService;

    return {
      local: env === CI_ENVIRONMENT.LOCAL,
      // even though FileSG wont be creating table programmatically using dynamoose,
      // set these to false to prevent any accidental table creation using new Table()
      table: { create: false, update: false, waitForActive: false },
      logger: nodeEnv === ENVIRONMENT.DEVELOPMENT ? new Logger('DatabaseModule') : undefined,
    };
  },
});
