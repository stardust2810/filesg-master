import { Message, SQSClient } from '@aws-sdk/client-sqs';
import { SqsService } from '@filesg/aws';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { camelCase } from 'lodash';
import { Logger as PinoLogger } from 'nestjs-pino';
import { setTimeout as sleep } from 'timers/promises';

import { AppModule } from './modules/app.module';
import { SftpProcessorService } from './modules/features/sftp-processor/sftp-processor.service';
import { LambdaSqsMessage } from './typings';

/*
 * FOR LOCAL TESTING OF SERVICES ONLY
 */

// =============================================================================
// For localstack SQS
// =============================================================================
const SQS_URL = 'http://localhost:4566/000000000000/sqs-fsg2-localezapp-sftp-processor';
const sqsClient = new SQSClient({
  region: 'ap-southeast-1',
  endpoint: 'http://localhost:4566',
});

const sqsService = new SqsService(sqsClient);

async function pollSqs(sftpProcesserService: SftpProcessorService, logger: Logger) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    logger.log('retrieving messages');
    try {
      const incomingMessages = await sqsService.receiveMessageFromSqs(SQS_URL, 10);

      if (incomingMessages && incomingMessages.length > 0) {
        // Triggered by S3 event notification and only will have 1 message
        await sftpProcesserService.run(convertSqsMessageToLambdaSqsMessage(incomingMessages[0]));
      }

      await sleep(2 * 1000);
    } catch (error) {
      logger.error(`Failed to consume message from SQS. Error: ${JSON.stringify(error)}`);
    }
  }
}

// =============================================================================
// For localstack SQS
// =============================================================================
// LambdaSqsEvent will change Message's property from PascalCase to camalCase, hence need a converter
function convertSqsMessageToLambdaSqsMessage(message: Message): LambdaSqsMessage {
  return Object.keys(message).reduce((acc, curr) => {
    const camalCaseKey = camelCase(curr);

    (acc as any)[camalCaseKey] = message[curr as keyof Message];

    return acc;
  }, {} as LambdaSqsMessage);
}

// =============================================================================
// SFTP Processor
// =============================================================================
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');
  const sftpProcessorService = app.get(SftpProcessorService);

  app.useLogger(app.get(PinoLogger));
  app.flushLogs();

  await pollSqs(sftpProcessorService, logger);
}

bootstrap();
