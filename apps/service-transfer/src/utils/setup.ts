import { CI_ENVIRONMENT } from '@filesg/common';
import { Logger, RequestMethod } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { FileSGConfigService } from '../modules/setups/config/config.service';

export const setupSwagger = (app: NestExpressApplication, logger: Logger) => {
  const configService = app.get(FileSGConfigService);
  const { env, serviceName, appName, appVersion } = configService.systemConfig;

  const bearerAuthSchema: SecuritySchemeObject = {
    description: 'JWT Authorization',
    type: 'http',
    in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  };

  if (env !== CI_ENVIRONMENT.PRD) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`${appName} APIs`)
      .setDescription('The list of apis from FileSG')
      .setVersion(appVersion)
      .addTag(serviceName)
      .addBearerAuth(bearerAuthSchema, 'File Upload Token')
      .addBearerAuth(bearerAuthSchema, 'File Download Token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`api/${serviceName}/api-docs`, app, document);
    logger.log(`Start Swagger on /api/${serviceName}/api-docs route version: ${appVersion}`);
  }
};

export const setupGlobalPrefix = (app: NestExpressApplication, logger: Logger) => {
  const configService = app.get(FileSGConfigService);
  const { serviceName } = configService.systemConfig;
  app.setGlobalPrefix(`api/${serviceName}`, {
    exclude: [{ path: '/health-check', method: RequestMethod.GET }],
  });
  logger.log(`Setup Paths to exclude global prefix`);
};
