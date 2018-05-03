import {Module} from '@nestjs/common';
import {WebhookController} from './webhook.controller';

@Module({
  imports: [],
  components: [],
  controllers: [WebhookController],
})
export class WebhookModule {}
