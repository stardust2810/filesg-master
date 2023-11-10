/**
 * Ref: https://www.petermorlion.com/nestjs-aws-lambda-without-http/
 * Ref: https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 *
 * NOTE: As this lambda is slightly different compared to other lambda whereby other lambda has main file for local testing
 * and lambda's name file (e.g. post-scan.ts) with for production use, this lambda has only a main file for both local testing
 * and production use. This is due to the nature of this lambda which is to be triggered by invocation instead of subscribing
 * to any sns or sqs.
 */

import { DocumentEncryptionErrorOutput, DocumentEncryptionSuccessOutput } from '@filesg/backend-common';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './modules/app.module';
import { DocEncryptionService } from './modules/features/doc-encryption/doc-encryption.service';

let app: INestApplicationContext;

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(PinoLogger));

  return app;
}

// Running the bootstrap outside of handler to minimize cold starts
bootstrap().then((result) => {
  app = result;
});

async function waitForApp(event: any, context: any): Promise<DocumentEncryptionSuccessOutput | DocumentEncryptionErrorOutput> {
  return await new Promise((resolve) => {
    setImmediate(async () => {
      if (!app) {
        await waitForApp(event, context);
      } else {
        resolve(await main(event));
      }
    });
  });
}

async function main(event: any) {
  const docEncryptionService = app.get(DocEncryptionService);
  return await docEncryptionService.processEvent(event);
}

// TODO: come back with the typing
export async function handler(event: any, context: any) {
  if (app) {
    return await main(event);
  } else {
    return await waitForApp(event, context);
  }
}
