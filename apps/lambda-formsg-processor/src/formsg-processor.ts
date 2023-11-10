import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './modules/app.module';
import { FormSgProcessorService } from './modules/features/formsg-processor/formsg-processor.service';

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

async function waitForApp(event: any, context: any): Promise<any> {
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
  const service = app.get(FormSgProcessorService);
  return await service.run(event);
}

export async function handler(event: any, context: any) {
  if (app) {
    return await main(event);
  } else {
    return await waitForApp(event, context);
  }
}
