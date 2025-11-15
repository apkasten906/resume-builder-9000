const LEVEL_WEIGHTS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: Number.POSITIVE_INFINITY,
} as const;

type LevelName = keyof typeof LEVEL_WEIGHTS;

type LogWriter = (message?: unknown, ...optionalParams: unknown[]) => void;

interface LoggerOptions {
  level?: LevelName | string;
  base?: Record<string, unknown>;
}

interface PinoLikeLogger {
  trace(meta?: unknown, message?: string): void;
  debug(meta?: unknown, message?: string): void;
  info(meta?: unknown, message?: string): void;
  warn(meta?: unknown, message?: string): void;
  error(meta?: unknown, message?: string): void;
  fatal(meta?: unknown, message?: string): void;
  child(bindings: Record<string, unknown>): PinoLikeLogger;
  flush(): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveThreshold(level?: string): LevelName {
  if (!level) {
    return 'info';
  }

  const normalized = level.toLowerCase() as LevelName;
  return normalized in LEVEL_WEIGHTS ? normalized : 'info';
}

function shouldLog(messageLevel: LevelName, threshold: LevelName): boolean {
  return LEVEL_WEIGHTS[messageLevel] >= LEVEL_WEIGHTS[threshold];
}

function buildPayload(
  base: Record<string, unknown>,
  meta: unknown
): Record<string, unknown> | undefined {
  const payload: Record<string, unknown> = { ...base };

  if (isRecord(meta)) {
    Object.assign(payload, meta);
  } else if (meta !== undefined) {
    payload.meta = meta;
  }

  return Object.keys(payload).length > 0 ? payload : undefined;
}

function createLogMethod(
  level: LevelName,
  threshold: LevelName,
  writer: LogWriter,
  base: Record<string, unknown>
): (meta?: unknown, message?: string) => void {
  return (meta, message) => {
    if (!shouldLog(level, threshold)) {
      return;
    }

    const prefix = `[${level.toUpperCase()}]`;
    const payload = buildPayload(base, meta);

    if (message && payload) {
      writer(`${prefix} ${message}`, payload);
      return;
    }

    if (message) {
      writer(`${prefix} ${message}`);
      return;
    }

    if (payload) {
      writer(prefix, payload);
      return;
    }

    writer(prefix);
  };
}

function createLogger(options: LoggerOptions = {}): PinoLikeLogger {
  const threshold = resolveThreshold(options.level);
  const baseContext = { ...(options.base ?? {}) };

  const logger: PinoLikeLogger = {
    trace: createLogMethod('trace', threshold, console.debug.bind(console), baseContext),
    debug: createLogMethod('debug', threshold, console.debug.bind(console), baseContext),
    info: createLogMethod('info', threshold, console.info.bind(console), baseContext),
    warn: createLogMethod('warn', threshold, console.warn.bind(console), baseContext),
    error: createLogMethod('error', threshold, console.error.bind(console), baseContext),
    fatal: createLogMethod('fatal', threshold, console.error.bind(console), baseContext),
    child(bindings) {
      const mergedBase = { ...baseContext, ...bindings };
      return createLogger({ ...options, base: mergedBase });
    },
    flush() {
      // console streams are synchronous in this environment; nothing to flush
    },
  };

  return logger;
}

export type { LoggerOptions };
export type { PinoLikeLogger as Logger };
export default createLogger;
