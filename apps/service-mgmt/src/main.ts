import { GlobalExceptionsFilter, ValidationPipe } from '@filesg/backend-common';
import { SERVICE_NAME } from '@filesg/common';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'body-parser';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';

import { RootModule } from './modules/root.module';
import { FileSGConfigService } from './modules/setups/config/config.service';
import { setupGlobalPrefix, setupSwagger } from './utils/setup';

export default async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(RootModule, { bufferLogs: true });
  const logger = new Logger('boostrapping');

  const configService = app.get(FileSGConfigService);
  const { port, serviceName } = configService.systemConfig;
  logger.log(`Start bootstrapping fileSG ${serviceName} service`);

  app.use(json({ limit: '50mb' }));
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();
  app.enableCors({ origin: true, credentials: true }); // TODO: set cors according to the subdomains
  app.use(helmet());
  app.useGlobalFilters(new GlobalExceptionsFilter(SERVICE_NAME.MANAGEMENT));
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  setupSwagger(app, logger);
  setupGlobalPrefix(app, logger);
  logger.log(`Launching FileSG ${serviceName} on port ${port}`);

  const server = await app.listen(port);

  // internal most ALB idle timeout is 301 and this should be 1s longer
  // https://connectreport.com/blog/tuning-http-keep-alive-in-node-js/
  server.keepAliveTimeout = 301 * 1000 + 1000;
  server.headersTimeout = 301 * 1000 + 2000;
}

bootstrap();
