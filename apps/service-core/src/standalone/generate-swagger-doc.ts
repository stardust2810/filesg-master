/**
 * This file serves as a standalone NestJS application that will
 * 1. Start app server (with mocked database connection)
 * 2. Output Swagger Doc
 * 3. Close app
 *
 * Note: This will still try to connect to Redis server (and fail) but
 *       it does not hinder generation of the swagger file
 *
 * TODO: To turn off the connection to Redis totally. Most likely need to design
 *       Redis module in a different way
 */
import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { cloneDeep } from 'lodash';
import { DataSource } from 'typeorm';

import { nonDatabaseModules } from '../modules/root.module';
import { FileSGConfigService } from '../modules/setups/config/config.service';

// =============================================================================
// Merging aws openapi extension into OperationObject
// =============================================================================
type RequestParamters = Record<`integration.request.${string}`, string>;

// This is not the full list of options as the rest are not required
// Full list can be found here: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html
interface OperationObjectAwsExtension extends OperationObject {
  'x-amazon-apigateway-integration': {
    type: string;
    uri: string;
    connectionId: string;
    connectionType: 'VPC_LINK' | 'INTERNET';
    httpMethod: 'ANY' | 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH' | 'TRACE';
    passthroughBehavior: 'when_no_templates' | 'when_no_match' | 'never';
    requestParameters?: RequestParamters;
  };
}

// =============================================================================
// Setting up commandline options
// =============================================================================
const program = new Command();
program
  .option('-o, --output <output>', 'the output path for generated Swagger Doc')
  .option('-t, --tags <tags...>', 'specify the required tags')
  .option('-w, --with-aws-extension', 'will generate swagger doc with aws extension')
  .option('-p, --with-global-prefix', 'will generate swagger doc with global prefix');

program.parse();

// =============================================================================
// Modules to load for generating Swagger doc
// =============================================================================
@Module({
  imports: [
    ...nonDatabaseModules,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({}),
      connectionFactory: async () => {
        return new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }).initialize();
      },
    }),
  ],
})
class SwaggerDocModule {}

// =============================================================================
// Constants
// =============================================================================
type SwaggerDocHttpMethods = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
const SWAGGER_DOC_HTTP_METHODS: SwaggerDocHttpMethods[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

const LOGGER = new Logger('generate-swagger-doc');
LOGGER.log(`Bootstrapping FileSG core service for Swagger Json generation`);

// =============================================================================
// Functions
// =============================================================================
async function bootstrap(output = './swagger.json', requiredTags: string[] = [], withAwsExtension = false, withGlobalPrefix = false) {
  LOGGER.log(`Starting FileSG core service for swagger file generation.`);
  const app = await NestFactory.create<NestExpressApplication>(SwaggerDocModule, {
    logger: ['log'],
  });

  const configService = app.get(FileSGConfigService);
  const { appVersion, serviceName } = configService.systemConfig;
  if (withGlobalPrefix) {
    app.setGlobalPrefix(serviceName);
  }

  LOGGER.log(
    `Generating Swagger Doc to ${output} with requiredTags: ${JSON.stringify(requiredTags)} and aws extension: ${withAwsExtension}`,
  );
  generateSwaggerDoc(app, serviceName, appVersion, { output, requiredTags, withAwsExtension });

  LOGGER.log(`Shutting down FileSG core service`);
  await app.close();
}

function generateSwaggerDoc(
  app: NestExpressApplication,
  serviceName: string,
  appVersion: string,
  {
    output,
    requiredTags,
    withAwsExtension,
  }: {
    output: string;
    requiredTags: string[];
    withAwsExtension: boolean;
  },
) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${serviceName} APIs`)
    .setDescription('The list of apis from FileSG')
    .setVersion(appVersion)
    .build();

  let doc = filterSwaggerDocByTag(SwaggerModule.createDocument(app, swaggerConfig), requiredTags);

  if (withAwsExtension) {
    doc = addAwsExtension(doc);
  }

  writeFileSync(output, JSON.stringify(doc));
  LOGGER.log(`Saved Swagger Doc to ${output}`);
}

function filterSwaggerDocByTag(doc: OpenAPIObject, requiredTags: string[]) {
  if (!requiredTags.length) {
    return doc;
  }

  const clonedDoc = cloneDeep(doc);

  Object.keys(clonedDoc.paths).forEach((path) => {
    const pathItemObj = clonedDoc.paths[path];

    SWAGGER_DOC_HTTP_METHODS.forEach((method) => {
      const pathItemMethodObj = pathItemObj[method];

      if (pathItemMethodObj && !pathItemMethodObj.tags?.some((tag) => requiredTags.includes(tag))) {
        delete pathItemObj[method];
      }
    });

    // If no more http methods objects = can discard path
    if (!Object.keys(pathItemObj).some((key) => SWAGGER_DOC_HTTP_METHODS.includes(key as any))) {
      delete clonedDoc.paths[path];
    }
  });

  return clonedDoc;
}

function addAwsExtension(doc: OpenAPIObject): OpenAPIObject {
  const clonedDoc = cloneDeep(doc);

  Object.keys(clonedDoc.paths).forEach((path) => {
    const pathItemObj = clonedDoc.paths[path];

    SWAGGER_DOC_HTTP_METHODS.forEach((method) => {
      const pathItemMethodObj = pathItemObj[method] as OperationObjectAwsExtension;

      if (!pathItemMethodObj) {
        return;
      }

      const requestParameters = createRequestParameterList(path);

      pathItemMethodObj['x-amazon-apigateway-integration'] = {
        type: 'http_proxy',
        uri: 'https://${stageVariables.backend_url}' + path,
        connectionId: '${stageVariables.vpc_link_id}',
        connectionType: 'VPC_LINK',
        httpMethod: 'ANY',
        passthroughBehavior: 'when_no_match',
        ...(Object.keys(requestParameters).length > 0 && { requestParameters }),
      };
    });
  });

  return clonedDoc;
}

function createRequestParameterList(path: string): RequestParamters {
  const parametersList: RequestParamters = {};

  // eslint-disable-next-line security/detect-unsafe-regex
  const bracedContent = path.match(/(?<={).*?(?=})/g) ?? [];

  for (const content of bracedContent) {
    parametersList[`integration.request.path.${content}`] = `method.request.path.${content}`;
  }

  return parametersList;
}

// =============================================================================
// Main
// =============================================================================
bootstrap(program.opts().output, program.opts().tags, program.opts().withAwsExtension, program.opts().withGlobalPrefix);
