import { GlobalExceptionsFilter, ValidationPipe } from '@filesg/backend-common';
import { SERVICE_NAME } from '@filesg/common';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';

import { RootModule } from './modules/root.module';
import { FileSGConfigService } from './modules/setups/config/config.service';
import { setupCookieParser, setupExpressSession, setupGlobalPrefix, setupSwagger } from './utils/setup';

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(RootModule, { bufferLogs: true });
  const logger = new Logger('bootstrap');
  const configService = app.get(FileSGConfigService);
  const { port, serviceName } = configService.systemConfig;
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();
  app.enableCors({ origin: [/\.file\.gov\.sg$/], credentials: true });
  app.use(helmet());
  app.useGlobalFilters(new GlobalExceptionsFilter(SERVICE_NAME.CORE));
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  await setupCookieParser(app, logger);
  await setupExpressSession(app, logger);
  setupGlobalPrefix(app, logger);
  await setupSwagger(app, logger);

  const server = await app.listen(port);

  // internal most ALB idle timeout is 301 and this should be 1s longer
  // https://connectreport.com/blog/tuning-http-keep-alive-in-node-js/
  server.keepAliveTimeout = 301 * 1000 + 1000;
  server.headersTimeout = 301 * 1000 + 2000;

  logger.log(`Launching FileSG ${serviceName} service on port ${port}`);
  return app;
}

bootstrap();
