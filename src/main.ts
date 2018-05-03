import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from './app.module';
import { LoggerService } from "./utils/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    logger: LoggerService.create('Main'),
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
