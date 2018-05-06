import { Module, NestModule, MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import { controllers } from './web';
import { providers } from './providers';
import { services } from './services';

@Module({
  imports: [],
  controllers: [...controllers],
  components: [...providers, ...services],
})
export class ApplicationModule {}
