/**
 * Ref: https://www.petermorlion.com/nestjs-aws-lambda-without-http/
 * Ref: https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 *
 */

import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './modules/app.module';
import { ScanResultProcessorService } from './modules/features/scan-result-processor/scan-result-processor.service';
import { LambdaSnsEvent } from './typings/common';

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

async function waitForApp(event: any, context: any) {
  setImmediate(async () => {
    if (!app) {
      await waitForApp(event, context);
    } else {
      await main(event);
    }
  });
}

async function main(event: LambdaSnsEvent) {
  const scanResultProcessor = app.get(ScanResultProcessorService);
  await scanResultProcessor.processEvent(event);
}

export async function handler(event: LambdaSnsEvent, context: any) {
  if (app) {
    await main(event);
  } else {
    await waitForApp(event, context);
  }
}
