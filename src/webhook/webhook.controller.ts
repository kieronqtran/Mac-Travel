import {Request, Response} from 'express';
import {Controller, Get, Post, Req, Res, HttpStatus} from '@nestjs/common';
import { LoggerService } from "../utils/logger.service";

const VALIDATION_TOKEN = 'this_is_my_token';

@Controller('webhook')
export class WebhookController {
  private readonly logger = LoggerService.create(WebhookController.name);

  constructor() {}

  @Get()
  getValidation(@Req() req: Request, @Res() res: Response) {
    if (
      req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN
    ) {
      this.logger.log('Validating webhook');
      res.status(HttpStatus.OK).send(req.query['hub.challenge']);
    } else {
      this.logger.log('Invalid token.');
      res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  @Post()
  fbListerner(@Req() req: Request, @Res() res: Response) {
    const data = req.body;

    if (data.object === 'page') {
      this.thisIsAsyncFunction();
    }

    res.sendStatus(HttpStatus.OK);
  }

  async thisIsAsyncFunction() {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        this.logger.log(`should happened after 1st.`);
        resolve();
      },1000);
    });
    this.logger.log(`should happened after 2nd.`);
  }
}
