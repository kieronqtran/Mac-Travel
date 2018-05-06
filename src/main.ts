import { NestFactory } from '@nestjs/core';
import { environments } from './utils/config';
import { ApplicationModule } from './app.module';
import { LoggerService } from './shared/logger.service';
import 'isomorphic-fetch';

async function bootstrap() {
  const logger = LoggerService.create('Main');
  const app = await NestFactory.create(ApplicationModule, {
    logger,
  });
  await app.listen(environments.port, () => {
    logger.log(`Webhook is listerning on port: ${environments.port}`);
  });
}

bootstrap();
