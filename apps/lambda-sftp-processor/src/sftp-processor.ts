/**
 * Ref: https://www.petermorlion.com/nestjs-aws-lambda-without-http/
 * Ref: https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 *
 */

import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { INestApplicationContext } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { ProcessMessageErrorException } from './common/custom-exceptions';
import { RESULT_LOG_PREFIX } from './const';
import { AppModule } from './modules/app.module';
import { SftpProcessorService } from './modules/features/sftp-processor/sftp-processor.service';
import { LambdaSqsEvent } from './typings';

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

async function waitForApp(event: LambdaSqsEvent, context: any) {
  setImmediate(async () => {
    if (!app) {
      await waitForApp(event, context);
    } else {
      await main(event);
    }
  });
}

async function main({ Records }: LambdaSqsEvent) {
  const sftpProcessor = app.get(SftpProcessorService);
  const logger = new Logger('SftpProcessorMain');

  const allSettledResults = await Promise.allSettled(Records.map(async (record) => await sftpProcessor.run(record)));

  const failures: Array<{ messageId: string | undefined; errorMessage: string }> = [];
  allSettledResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      failures.push({
        messageId: Records[index].messageId,
        errorMessage: result.reason.message,
      });
    }
  });

  if (failures.length > 0) {
    const errorLog = `[${RESULT_LOG_PREFIX}][ERROR] Unexpected errors: ${JSON.stringify(failures)}`;
    throw new ProcessMessageErrorException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, errorLog);
  }
}

export async function handler(event: LambdaSqsEvent, context: any) {
  if (app) {
    await main(event);
  } else {
    await waitForApp(event, context);
  }
}
