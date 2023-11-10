import { Message, SQSClient } from '@aws-sdk/client-sqs';
import { SqsService } from '@filesg/aws';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';
import { setTimeout as sleep } from 'timers/promises';

import { AppModule } from './modules/app.module';
import { ScanResultProcessorService } from './modules/features/scan-result-processor/scan-result-processor.service';
import { LambdaSnsEvent } from './typings/common';

/*
 * FOR LOCAL TESTING OF SERVICES ONLY
 */

// =============================================================================
// For localstack SQS
// =============================================================================
const SQS_URL = 'http://localhost:4566/000000000000/sqs-fsg2-localezapp-lambda-postscan';
const sqsClient = new SQSClient({
  region: 'ap-southeast-1',
  endpoint: 'http://localhost:4566',
});

const sqsService = new SqsService(sqsClient);

async function pollSqs(scanResultProcessor: ScanResultProcessorService, logger: Logger) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const incomingMessages = await sqsService.receiveMessageFromSqs(SQS_URL, 10);

      if (incomingMessages && incomingMessages.length > 0) {
        const snsMessage = convertSqsToSnSEvent(incomingMessages);
        await scanResultProcessor.processEvent(snsMessage);
        await sqsService.deleteMessageInSqs(SQS_URL, incomingMessages[0]);
      }

      await sleep(2 * 1000);
    } catch (error) {
      logger.error(`Failed to consume message from SQS. Error: ${JSON.stringify(error)}`);
    }
  }
}

// =============================================================================
// As SQS is used in localstack for lambda-postscan, transformer is required
// to convert SQS message to SNS message
// =============================================================================
function convertSqsToSnSEvent(sqsMessages: Message[]): LambdaSnsEvent {
  return {
    Records: [
      {
        EventVersion: 'test',
        EventSubscriptionArn: 'test',
        EventSource: 'test',
        Sns: {
          SignatureVersion: 'test',
          Timestamp: 'test',
          Signature: 'test',
          SigningCertUrl: 'test',
          MessageId: 'mockMessageId',
          Message: sqsMessages[0].Body!,
          MessageAttributes: {
            Test: {
              Type: 'test',
              Value: 'test',
            },
            TestBinary: {
              Type: 'test',
              Value: 'test',
            },
          },
          Type: 'test',
          UnsubscribeUrl: 'test',
          TopicArn: 'test',
          Subject: 'test',
        },
      },
    ],
  };
}

// =============================================================================
//  Post scan: scan result processor
// =============================================================================
export default async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');
  const scanResultProcessor = app.get(ScanResultProcessorService);

  app.useLogger(app.get(PinoLogger));
  app.flushLogs();

  await pollSqs(scanResultProcessor, logger);
}

bootstrap();
