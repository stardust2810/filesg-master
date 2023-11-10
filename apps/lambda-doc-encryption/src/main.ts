/**
 * Ref: https://www.petermorlion.com/nestjs-aws-lambda-without-http/
 * Ref: https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 */

import { DocumentEncryptionErrorOutput, DocumentEncryptionInput, DocumentEncryptionSuccessOutput } from '@filesg/backend-common';
import { Body, Controller, HttpCode, INestApplicationContext, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './modules/app.module';
import { DocEncryptionService } from './modules/features/doc-encryption/doc-encryption.service';

let app: INestApplicationContext;

/*
 * FOR LOCAL TESTING OF SERVICES ONLY
 */
@Controller('doc-encryption')
export class TestController {
  @Post()
  @HttpCode(200)
  async doDocEncryption(@Body() input: DocumentEncryptionInput): Promise<DocumentEncryptionSuccessOutput | DocumentEncryptionErrorOutput> {
    const docEncryptionService = app.get(DocEncryptionService);
    return await docEncryptionService.processEvent(input);
  }
}

@Module({
  imports: [AppModule],
  controllers: [TestController],
})
class FacadeAppModule {}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(FacadeAppModule);
  app.useLogger(app.get(PinoLogger));

  await app.listen(3004);

  return app;
}

// Running the bootstrap outside of handler to minimize cold starts
bootstrap().then((result) => {
  app = result;
});
