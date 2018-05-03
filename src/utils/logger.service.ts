import { LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger, transports, LoggerInstance, LoggerOptions, TransportInstance } from "winston";

export const enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug'
}

export class LoggerService implements NestLoggerService {

  private readonly logger: LoggerInstance;

  static create(context: string, customsTransports?: TransportInstance[]) {
    return new this(context, customsTransports);
  }

  private constructor(private context: string, customsTransports?: TransportInstance[]) {
    const serviceTransports = customsTransports || [
      new transports.Console({

        exitOnError: false,
      })
    ];
    this.logger = new Logger({
      transports: serviceTransports
    })
  }

  get Logger(): LoggerInstance {
    return this.logger; // idk why i have this in my code !
  }

  overrideOptions(options: LoggerOptions) {
    this.logger.configure(options);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  log(message: string): void {
    this.logger.log(LogLevel.INFO, message);
  }
  error(message: string, trace: string): void {
    this.logger.error(message, trace);
  }
  warn(message: string): void {
    this.logger.warning(message);
  }
}
