// act knowlegde to shekohex
// date: 4th May - ref: https://github.com/nestjs/nest/issues/507#comment-374221089
import { LoggerService as NestLoggerService } from '@nestjs/common';
import * as chalk from 'chalk';
import * as PrettyError from 'pretty-error'; // it's really handy to make your life easier
import { Logger, transports, LoggerInstance, LoggerOptions, TransportInstance } from 'winston';

export const enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
}

export class LoggerService implements NestLoggerService {
  private readonly logger: LoggerInstance;
  private readonly prettyError = new PrettyError();

  public static loggerOptions: LoggerOptions = {
    transports: [
      // new transports.File({
      //   filename: 'app.dev.log', // i will explain this later
      //   json: true,
      //   prettyPrint: true,
      //   timestamp: true,
      // }),
    ],
  };

  static create(context: string, customsTransports?: TransportInstance[]) {
    return new this(context, customsTransports);
  }

  private constructor(private context: string, customsTransports?: TransportInstance[]) {
    this.logger = new Logger(LoggerService.loggerOptions);
    this.prettyError.skipNodeFiles();
    this.prettyError.skipPackage('express', '@nestjs/common', '@nestjs/core');
  }

  static configGlobal(options?: LoggerOptions) {
    this.loggerOptions = options;
  }

  get Logger(): LoggerInstance {
    return this.logger; // idk why i have this in my code !
  }

  overrideOptions(options: LoggerOptions) {
    this.logger.configure(options);
  }

  debug(message: string): void {
    if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_DEBUG !== 'true') {
      this.formatedLog('debug', message);
    }
  }

  log(message: string): void {
    const currentDate = new Date();
    this.logger.info(message, {
      timestamp: currentDate.toISOString(),
      context: this.context,
    });
    this.formatedLog('info', message);
  }

  error(message: string, trace?: any): void {
    const currentDate = new Date();
    // i think the trace should be JSON Stringified
    this.logger.error(`${message} -> (${trace || 'trace not provided !'})`, {
      timestamp: currentDate.toISOString(),
      context: this.context,
    });
    this.formatedLog('error', message, trace);
  }

  warn(message: string): void {
    const currentDate = new Date();
    this.logger.warn(message, {
      timestamp: currentDate.toISOString(),
      context: this.context,
    });
    this.formatedLog('warn', message);
  }

  // this method just for printing a cool log in your terminal , using chalk
  private formatedLog(level: string, message: string, error?): void {
    let result = '';
    const color = chalk.default;
    const currentDate = new Date();
    const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

    switch (level) {
      case 'debug':
        result = `[${color.blue('DEBUG')}] ${color.dim.yellow.bold.underline(time)} [${color.green(this.context)}] ${message}`;
        break;
      case 'info':
        result = `[${color.blue('INFO')}] ${color.dim.yellow.bold.underline(time)} [${color.green(this.context)}] ${message}`;
        break;
      case 'error':
        result = `[${color.red('ERR')}] ${color.dim.yellow.bold.underline(time)} [${color.green(this.context)}] ${message}`;
        if (error && process.env.NODE_ENV === 'dev') this.prettyError.render(error, true);
        break;
      case 'warn':
        result = `[${color.yellow('WARN')}] ${color.dim.yellow.bold.underline(time)} [${color.green(this.context)}] ${message}`;
        break;
      default:
        break;
    }
    console.log(result);
  }
}
