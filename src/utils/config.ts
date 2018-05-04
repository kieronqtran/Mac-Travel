import 'dotenv/config';
import { LoggerService } from '../shared/logger.service';
const logger = LoggerService.create('ENVIRONMENT', []);

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

logger.debug(`NODE_ENV is setted with value ${process.env.NODE_ENV}`);

export const environments = {
  port: process.env.PORT || 3000,
  production: process.env.NODE_ENV === 'production',
  test: process.env.NODE_ENV === 'test',
  appSecret: Env('MESSENGER_APP_SECRET', null, true),
  validationToken: Env('MESSENGER_VALIDATION_TOKEN', null, true),
  accessToken: Env('MESSENGER_PAGE_ACCESS_TOKEN', null, true),
  serverUrl: Env('SERVER_URL', null, true),
  mongoUrl: Env('MONGODB_URI', null, true),
  messengerCallbackUrl: Env('MESSENGER_CALLBACK_URL', 'https://graph.facebook.com/v2.12/me'),
};
