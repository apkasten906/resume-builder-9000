/**
 * Centralized logger for the API application
 * Provides structured logging with environment-specific configuration
 */
import { LoggerUtils, type Environment, type UniversalLogger } from '@rb9k/core';

const environment = (process.env.NODE_ENV || 'development') as Environment;

/**
 * Main logger instance for the API application
 * Automatically configured based on environment
 */
export const logger = ((): UniversalLogger => {
  switch (environment) {
    case 'test':
      return LoggerUtils.forTest('rb9k-api');
    case 'production':
      return LoggerUtils.forProduction('rb9k-api');
    case 'development':
    default:
      return LoggerUtils.forDevelopment('rb9k-api');
  }
})();

/**
 * Create a child logger for controllers
 * Useful for controller-specific logging
 */
export function createControllerLogger(controller: string): UniversalLogger {
  return logger.child({
    component: 'controller',
    controller,
  });
}

/**
 * Create a child logger for services
 * Useful for service-specific logging
 */
export function createServiceLogger(service: string): UniversalLogger {
  return logger.child({
    component: 'service',
    service,
  });
}

/**
 * Create a child logger for middleware
 * Useful for middleware-specific logging
 */
export function createMiddlewareLogger(middleware: string): UniversalLogger {
  return logger.child({
    component: 'middleware',
    middleware,
  });
}

/**
 * Create a child logger for database operations
 * Useful for database-specific logging
 */
export function createDbLogger(operation?: string): UniversalLogger {
  return logger.child({
    component: 'database',
    ...(operation && { operation }),
  });
}

// Export the main logger as default
export default logger;
