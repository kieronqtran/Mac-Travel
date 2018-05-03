import {Module, NestModule, MiddlewaresConsumer, RequestMethod} from '@nestjs/common';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [WebhookModule],
})
export class ApplicationModule {
}
