import 'dotenv/config';
import { LoggerService } from '../shared/logger.service';
const logger = LoggerService.create('ENVIRONMENT', { transports: [] });

// Get an env value by key
export const Env = <T>(key: string, defaultValue = null, required = false): string => {
  if (process.env[key] == null && required) {
    logger.error(`${key} value is missing.`);
    process.exit(1);
  }
  const value = process.env[key] == null ? defaultValue : process.env[key];
  logger.debug(`${key} is setted with value ${value}`);
  return value;
};
const getDialogflowCredentials = (): DialogflowCredentials => {
  if (!process.env['DIALOGFLOW_CREDENTIALS']) {
    logger.error(`DIALOGFLOW_CREDENTIALS value is missing.`);
    process.exit(1);
  }
  try {
    return JSON.parse(process.env['DIALOGFLOW_CREDENTIALS'], (key: string, value) => {
      const keys = [
        'type',
        'project_id',
        'private_key_id',
        'private_key',
        'client_email',
        'client_id',
        'auth_uri',
        'token_uri',
        'client_x509_cert_url',
        'auth_provider_x509_cert_url',
        '',
      ];
      if (!keys.some(e => e === key)) {
        logger.error(`${key} is not in DIALOGFLOW_CREDENTIALS.`);
        process.exit(1);
      }
      logger.debug(`${key}=${value}`);
      return value;
    });
  } catch (error) {
    logger.error(`Failed to parse DIALOGFLOW_CREDENTIALS json`);
    process.exit(1);
  }
};

logger.debug(`NODE_ENV is setted with value ${process.env.NODE_ENV}`);

export const environments = {
  port: process.env.PORT || 3000,
  production: process.env.NODE_ENV === 'production',
  test: process.env.NODE_ENV === 'test',
  dialogflow: getDialogflowCredentials(),
  messenger: {
    appSecret: Env('MESSENGER_APP_SECRET', null, true),
    validationToken: Env('MESSENGER_VALIDATION_TOKEN', null, true),
    accessToken: Env('MESSENGER_PAGE_ACCESS_TOKEN', null, true),
    callbackUrl: Env('MESSENGER_CALLBACK_URL', 'https://graph.facebook.com/v2.12/me'),
  },
  serverUrl: Env('SERVER_URL', null, true),
  mongoUrl: Env('MONGODB_URI', null, true),
};

interface DialogflowCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  client_x509_cert_url: string;
  auth_provider_x509_cert_url: string;
}
