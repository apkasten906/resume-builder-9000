import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';

// Re-export existing TestLogger for backward compatibility
export { TestLogger, testLogger, type TestLoggerOptions } from './testLogger.js';

/**
 * Valid environment types
 */
export type Environment = 'development' | 'test' | 'production';

/**
 * Valid log levels
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Universal Logger Configuration
 */
export interface LoggerConfig {
  level?: LogLevel;
  environment?: Environment;
  service: string;
  version?: string;
  prettyPrint?: boolean;
}

/**
 * Universal Logger that wraps Pino with enhanced capabilities
 * Provides structured logging for both runtime and test environments
 */
export class UniversalLogger {
  private readonly pino: PinoLogger;
  private readonly config: Required<LoggerConfig>;

  constructor(config: LoggerConfig) {
    const env = process.env.NODE_ENV;
    const validEnvironments: Environment[] = ['development', 'test', 'production'];
    const environment: Environment =
      config.environment ||
      (validEnvironments.includes(env as Environment) ? (env as Environment) : 'development');

    this.config = {
      level: config.level || 'info',
      environment,
      service: config.service,
      version: config.version || process.env.npm_package_version || 'unknown',
      prettyPrint: config.prettyPrint ?? process.env.NODE_ENV === 'development',
    };

    // Configure Pino based on environment
    const pinoConfig: pino.LoggerOptions = {
      name: this.config.service,
      level: this.config.level,
      base: {
        service: this.config.service,
        version: this.config.version,
        environment: this.config.environment,
      },
    };

    // Add pretty printing for development
    if (this.config.prettyPrint && this.config.environment === 'development') {
      pinoConfig.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname,service,version,environment',
        },
      };
    }

    // For test environment, reduce noise unless explicitly requested
    if (this.config.environment === 'test' && !process.env.TEST_LOG_ENABLE) {
      pinoConfig.level = 'silent';
    }

    this.pino = pino(pinoConfig);
  }

  /**
   * Log a trace message (most verbose)
   */
  trace(message: string, meta?: object): void {
    this.pino.trace(meta, message);
  }

  /**
   * Log a debug message
   */
  debug(message: string, meta?: object): void {
    this.pino.debug(meta, message);
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: object): void {
    this.pino.info(meta, message);
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: object): void {
    this.pino.warn(meta, message);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, meta?: object): void {
    const errorMeta = error ? { err: error, ...meta } : meta;
    this.pino.error(errorMeta, message);
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, error?: Error, meta?: object): void {
    const errorMeta = error ? { err: error, ...meta } : meta;
    this.pino.fatal(errorMeta, message);
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings: object): UniversalLogger {
    const childPino = this.pino.child(bindings);
    const childLogger = Object.create(UniversalLogger.prototype);
    childLogger.pino = childPino;
    childLogger.config = this.config;
    return childLogger;
  }

  /**
   * Get the underlying Pino logger for advanced use cases
   */
  getPinoLogger(): PinoLogger {
    return this.pino;
  }

  /**
   * Flush any buffered logs (useful for graceful shutdown)
   */
  flush(): void {
    this.pino.flush();
  }
}

/**
 * Factory function to create a logger instance
 */
export function createLogger(service: string, config?: Partial<LoggerConfig>): UniversalLogger {
  return new UniversalLogger({
    service,
    ...config,
  });
}

/**
 * Default logger instance for the core package
 */
export const logger = createLogger('rb9k-core');

/**
 * Logger configuration utilities
 */
export const LoggerUtils = {
  /**
   * Configure logger for test environment
   */
  forTest(service: string): UniversalLogger {
    return createLogger(service, {
      environment: 'test',
      level: 'warn', // Reduce noise in tests unless TEST_LOG_ENABLE is set
    });
  },

  /**
   * Configure logger for development environment
   */
  forDevelopment(service: string): UniversalLogger {
    return createLogger(service, {
      environment: 'development',
      level: 'debug',
      prettyPrint: true,
    });
  },

  /**
   * Configure logger for production environment
   */
  forProduction(service: string): UniversalLogger {
    return createLogger(service, {
      environment: 'production',
      level: 'info',
      prettyPrint: false,
    });
  },
};
