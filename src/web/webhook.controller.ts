import { Request, Response } from 'express';
import { Controller, Get, Post, Req, Res, HttpStatus, Body, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/logger.service';
import { ShopingCartService } from '../services/shopping-cart.service';
import { environments } from '../utils';

@Controller('webhook')
export class WebhookController {
  private readonly logger = LoggerService.create(WebhookController.name);

  constructor(@Inject(ShopingCartService) private readonly shoppingCartService: ShopingCartService) {}

  @Get()
  getValidation(@Req() req: Request, @Res() res: Response) {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === environments.messenger.validationToken) {
      this.logger.log('Webhook validated successful.');
      res.status(HttpStatus.OK).send(req.query['hub.challenge']);
    } else {
      this.logger.error('Invalid token.', {
        excepted: environments.messenger.validationToken,
        actual: req.query['hub.verify_token'],
      });
      res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  @Post()
  fbListerner(@Body() data: any, @Res() res: Response) {
    this.logger.debug(`Received: ${JSON.stringify(data)}`);

    if (data.object === 'page') {
      this.thisIsAsyncFunction(data);
    }

    res.sendStatus(HttpStatus.OK);
  }

  async thisIsAsyncFunction(data) {
    const instance = this.shoppingCartService.forUser(data.sender.id);
    console.dir(instance, { depth: null });
  }
}
