/**
 * Test Logger Utility - Provides structured logging for test files
 * Replaces console.log with proper test logging that can be controlled
 * via environment variables and provides better debugging capabilities.
 */

interface TestLoggerOptions {
  enableConsole?: boolean;
  enableFile?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  testName?: string;
}

class TestLogger {
  private readonly options: Required<TestLoggerOptions>;
  private readonly logs: Array<{
    level: string;
    message: string;
    timestamp: Date;
    testName?: string;
  }> = [];

  constructor(options: TestLoggerOptions = {}) {
    this.options = {
      enableConsole:
        process.env.TEST_LOG_CONSOLE === 'true' || process.env.NODE_ENV === 'development',
      enableFile: process.env.TEST_LOG_FILE === 'true',
      logLevel: (process.env.TEST_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      testName: options.testName || 'unknown-test',
      ...options,
    };
  }

  private static readonly levels = { debug: 0, info: 1, warn: 2, error: 3 };

  private shouldLog(level: string): boolean {
    return (
      TestLogger.levels[level as keyof typeof TestLogger.levels] >=
      TestLogger.levels[this.options.logLevel]
    );
  }

  private log(level: string, message: unknown, ...args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date();
    const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    const safeStringify = (value: unknown): string => {
      try {
        return JSON.stringify(value);
      } catch {
        if (typeof value === 'function') return '[Function]';
        if (typeof value === 'symbol') return '[Symbol]';
        return '[Unserializable]';
      }
    };

    const fullMessage =
      args.length > 0
        ? `${formattedMessage} ${args.map(arg => safeStringify(arg)).join(' ')}`
        : formattedMessage;

    // Store log entry
    this.logs.push({
      level,
      message: fullMessage,
      timestamp,
      testName: this.options.testName,
    });

    // Console output if enabled
    if (this.options.enableConsole) {
      const prefix = `[${timestamp.toISOString()}] [${level.toUpperCase()}] [${this.options.testName}]`;

      switch (level) {
        case 'error':
          // eslint-disable-next-line no-console
          console.error(`${prefix} ${fullMessage}`);
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(`${prefix} ${fullMessage}`);
          break;
        case 'info':
          // eslint-disable-next-line no-console
          console.info(`${prefix} ${fullMessage}`);
          break;
        case 'debug':
        default:
          // eslint-disable-next-line no-console
          console.log(`${prefix} ${fullMessage}`);
          break;
      }
    }
  }

  debug(message: unknown, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: unknown, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: unknown, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: unknown, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  /**
   * Get all logs for analysis or assertion in tests
   */
  getLogs(): Array<{ level: string; message: string; timestamp: Date; testName?: string }> {
    return this.logs;
  }

  /**
   * Create a child logger with a specific test name context.
   * Note: The child logger does NOT inherit accumulated logs from its parent.
   * Each logger instance maintains its own log history.
   */
  child(testName: string): TestLogger {
    return new TestLogger({
      ...this.options,
      testName,
    });
  }
}

// Export singleton instance for convenience
export const testLogger = new TestLogger();

// Export class for creating custom instances
export { TestLogger };

// Export type for options
export type { TestLoggerOptions };
