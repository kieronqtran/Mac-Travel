import { Module, NestModule, MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import * as Controllers from './web';
import * as Providers from './providers';
import { services } from './services';

const controllers = Object.keys(Controllers).map(key => Controllers[key]);
const providers = Object.keys(Providers).map(key => Providers[key]);

@Module({
  imports: [],
  controllers: [...controllers],
  components: [...providers, ...services],
})
export class ApplicationModule {}
