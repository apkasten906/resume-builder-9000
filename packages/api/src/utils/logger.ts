import winston from 'winston';
import morgan from 'morgan';
import { Request, Response } from 'express';
import { TransformableInfo } from 'logform';

// Flag to control verbose logging during tests
let isVerboseLoggingEnabled = process.env.TEST_VERBOSE_LOGGING === 'true';
const isTestEnvironment = process.env.NODE_ENV === 'test';

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
let level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// In test environment, silence logging unless verbose mode is enabled
if (isTestEnvironment && !isVerboseLoggingEnabled) {
  level = 'error'; // Only show errors by default in tests
}

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
        // Skip HTTP logging in test environment unless verbose mode is enabled
        if (!isTestEnvironment || isVerboseLoggingEnabled) {
          logger.http(message.trim());
        }
      },
    },
    // Skip logging completely in test environment unless verbose mode is enabled
    skip: () => isTestEnvironment && !isVerboseLoggingEnabled,
  }
);

// Create a custom error handler middleware
const errorLogger = (err: Error, req: Request, res: Response, next: () => void): void => {
  // In test environment, only log errors if verbose mode is enabled
  if (!isTestEnvironment || isVerboseLoggingEnabled) {
    logger.error(`Error occurred: ${err.message}`, {
      url: req.originalUrl,
      method: req.method,
      stack: err.stack,
    });
  }
  next();
};

/**
 * Enables verbose logging during tests
 */
function enableVerboseLogging(): void {
  isVerboseLoggingEnabled = true;
  if (isTestEnvironment) {
    // Update transports log level for existing logger
    logger.transports.forEach(transport => {
      transport.level = 'debug';
    });
  }
}

/**
 * Disables verbose logging during tests
 */
function disableVerboseLogging(): void {
  isVerboseLoggingEnabled = false;
  if (isTestEnvironment) {
    // Update transports log level for existing logger
    logger.transports.forEach(transport => {
      transport.level = 'error';
    });
  }
}

export { logger, httpLogger, errorLogger, enableVerboseLogging, disableVerboseLogging };
