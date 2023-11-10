import { CI_ENVIRONMENT, COOKIE_ID, ENVIRONMENT } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Logger, RequestMethod } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import { SWAGGER_AUTH_NAME } from '../consts';
import { FileSGConfigService } from '../modules/setups/config/config.service';

export const setupSwagger = async (app: NestExpressApplication, logger: Logger) => {
  const configService = app.get(FileSGConfigService);
  const { env, appVersion, serviceName } = configService.systemConfig;

  const bearerAuthSchema: SecuritySchemeObject = {
    description: 'JWT Authorization',
    type: 'http',
    in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  };

  if (env !== CI_ENVIRONMENT.PRD) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`${serviceName} APIs`)
      .setDescription('The list of apis from FileSG')
      .setVersion(appVersion)
      .addTag(serviceName)
      .addBearerAuth(bearerAuthSchema, SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_2FA)
      .addBearerAuth(bearerAuthSchema, SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
      .addBearerAuth(bearerAuthSchema, SWAGGER_AUTH_NAME.BEARER_AUTH_VERIFY_FILE_RETRIEVAL)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`api/${serviceName}/api-docs`, app, document);
    logger.log(`Setup Swagger on /api/${serviceName}/api-docs route version: ${appVersion}`);
  }
};

export const setupExpressSession = async (app: NestExpressApplication, logger: Logger) => {
  const configService = app.get(FileSGConfigService);
  const redisService = app.get(RedisService);
  const RedisStore = connectRedis(session);

  const expressClient = redisService.getClient(FILESG_REDIS_CLIENT.EXPRESS_SESSION);
  const isProductionEnv = configService.systemConfig.nodeEnv === ENVIRONMENT.PRODUCTION;

  const redisSession = session({
    name: COOKIE_ID,
    store: new RedisStore({ client: expressClient, ttl: configService.sessionConfig.sessionLengthInSecs }),
    secret: configService.redisConfig.storeSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: isProductionEnv,
    cookie: {
      secure: isProductionEnv,
      httpOnly: true,
      sameSite: true,
    },
  });
  app.use(redisSession);
  logger.log(`Setup Redis Express Session`);
};

export const setupCookieParser = async (app: NestExpressApplication, logger: Logger) => {
  const configService = app.get(FileSGConfigService);
  const { storeSecret } = configService.redisConfig; // TODO can consider changing it to another
  app.use(cookieParser(storeSecret));
  logger.log(`Setup Cookie Parser`);
};

export const setupGlobalPrefix = (app: NestExpressApplication, logger: Logger) => {
  const configService = app.get(FileSGConfigService);
  const { serviceName } = configService.systemConfig;
  app.setGlobalPrefix(`api/${serviceName}`, {
    exclude: [{ path: '/health-check', method: RequestMethod.GET }],
  });
  logger.log(`Setup Paths to exclude global prefix`);
};
