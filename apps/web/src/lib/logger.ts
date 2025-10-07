/**
 * Centralized logger for the web application
 * Provides structured logging with environment-specific configuration
 */
import { LoggerUtils, type Environment, type UniversalLogger } from '@rb9k/core';

const environment = (process.env.NODE_ENV || 'development') as Environment;

/**
 * Main logger instance for the web application
 * Automatically configured based on environment
 */
export const logger = ((): UniversalLogger => {
  switch (environment) {
    case 'test':
      return LoggerUtils.forTest('rb9k-web');
    case 'production':
      return LoggerUtils.forProduction('rb9k-web');
    case 'development':
    default:
      return LoggerUtils.forDevelopment('rb9k-web');
  }
})();

/**
 * Create a child logger with additional context
 * Useful for page-specific or component-specific logging
 */
export function createPageLogger(page: string): UniversalLogger {
  return logger.child({ page });
}

/**
 * Create a child logger for API calls
 * Useful for tracking API requests and responses
 */
export function createApiLogger(endpoint: string): UniversalLogger {
  return logger.child({
    component: 'api-client',
    endpoint,
  });
}

/**
 * Create a child logger for components
 * Useful for component-specific debugging
 */
export function createComponentLogger(component: string): UniversalLogger {
  return logger.child({
    component,
  });
}

// Export the main logger as default
export default logger;
