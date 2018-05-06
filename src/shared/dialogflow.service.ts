import { Component as Injectable } from '@nestjs/common';
import { LoggerService } from '../shared';
import { environments } from '../utils';
import * as dialogflow from 'dialogflow';

const sessionId = 'quickstart-session-id';
const languageCode = 'en-US';

const sessionClient = new dialogflow.SessionsClient();

@Injectable()
export class DialogflowService {
  private readonly logger = LoggerService.create(DialogflowService.name);

  async detectIntent(query: string) {
    // Define session path
    const sessionPath = sessionClient.sessionPath(environments.dialogflow.project_id, sessionId);
    this.logger.debug(`Session Path: ${JSON.stringify(sessionPath, null, 4)}`);
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
  }
}
