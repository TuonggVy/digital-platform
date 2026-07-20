import { ConsoleLogger, Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, context }) => {
    return `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`;
  }),
);

const dailyRotateFileConfig = (filename: string, level: string) => ({
  filename,
  datePattern: 'DD-MM-YYYY',
  level,
  zippedArchive: true,
  maxSize: '500m',
  maxFiles: '14d',
});

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logger: Logger;

  constructor() {
    super();
    this.logger = createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: logFormat,
      transports: [
        new DailyRotateFile(dailyRotateFileConfig('logs/error/error-%DATE%.log', 'error')),
        new DailyRotateFile(dailyRotateFileConfig('logs/combined/combined-%DATE%.log', 'info')),
        new DailyRotateFile(dailyRotateFileConfig('logs/debug/debug-%DATE%.log', 'debug')),
        new DailyRotateFile(dailyRotateFileConfig('logs/warn/warn-%DATE%.log', 'warn')),
      ],
    });
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new transports.Console({ format: logFormat }));
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(trace ? `${message} - ${trace}` : message, { context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
