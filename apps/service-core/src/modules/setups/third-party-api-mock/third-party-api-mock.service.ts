import { FEATURE_TOGGLE } from '@filesg/common';
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { setupServer, SetupServerApi } from 'msw/node';

import { FileSGConfigService } from '../config/config.service';
import { thirdPartyApiMockHandlers } from './third-party-api-mock.handler';

@Injectable()
export class ThirdPartyApiMockService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(ThirdPartyApiMockService.name);
  private server: SetupServerApi | undefined;

  constructor(private readonly filesgConfigService: FileSGConfigService) {}

  onApplicationBootstrap() {
    const { toggleMockThirdPartyApi } = this.filesgConfigService.systemConfig;

    if (toggleMockThirdPartyApi !== FEATURE_TOGGLE.ON) {
      return;
    }

    this.startMswServer();
  }

  /**
   * Adding an auto restart MSW after specific period
   * Long running MSW server is causing the server to slow down
   */
  startMswServer() {
    this.logger.log('Starting up MSW server');
    this.server = setupServer(...thirdPartyApiMockHandlers(this.filesgConfigService));

    this.server.listen({ onUnhandledRequest: 'bypass' });

    // wrapping restartMswServer with a arrow function to pass in `this`
    setTimeout(() => this.restartMswServer(), 30 * 60 * 1000);
  }

  restartMswServer() {
    this.logger.log('Stopping MSW server');
    this.server?.close();
    this.startMswServer();
  }

  onApplicationShutdown() {
    this.logger.log(`Shutting down MSW server if it exists`);

    this.server?.close();
  }
}
