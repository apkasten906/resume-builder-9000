import winston from 'winston';
import morgan from 'morgan';
import { Request, Response } from 'express';
import { TransformableInfo } from 'logform';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Determine log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Create format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info: TransformableInfo) => {
    const timestamp = typeof info.timestamp === 'string' ? info.timestamp : 'N/A';
    const level = typeof info.level === 'string' ? info.level : 'unknown';
    const message = typeof info.message === 'string' ? info.message : '';
    return `${timestamp} ${level}: ${message}`;
  })
);

// Create format for file output (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level,
  levels,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
  ],
});

// Create HTTP request logger middleware
const httpLogger = morgan(
  // Define the format string
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  {
    // Log to winston
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }
);

// Create a custom error handler middleware
const errorLogger = (err: Error, req: Request, res: Response, next: () => void): void => {
  logger.error(`Error occurred: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });
  next();
};

export { logger, httpLogger, errorLogger };
