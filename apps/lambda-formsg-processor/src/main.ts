import { Body, Controller, HttpCode, INestApplicationContext, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './modules/app.module';
import { FormSgProcessorService } from './modules/features/formsg-processor/formsg-processor.service';

let app: INestApplicationContext;

/*
 * FOR LOCAL TESTING OF SERVICES ONLY
 */
@Controller('formsg-processor')
export class TestController {
  @Post()
  @HttpCode(201)
  async process(@Body() input: any): Promise<any> {
    const service = app.get(FormSgProcessorService);
    return await service.run(input);
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

  await app.listen(3006);

  return app;
}

// Running the bootstrap outside of handler to minimize cold starts
bootstrap().then((result) => {
  app = result;
});
